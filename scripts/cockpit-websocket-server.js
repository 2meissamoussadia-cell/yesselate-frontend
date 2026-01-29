/**
 * Serveur WebSocket Cockpit DG (V5)
 * Events: chantier:update, worker:gps, stock:low, payment:completed, emergency:alert
 * Usage: node scripts/cockpit-websocket-server.js
 * Frontend: NEXT_PUBLIC_COCKPIT_WS_URL=ws://localhost:3002
 */

const WebSocket = require('ws');

const PORT = 3002;
const PING_INTERVAL_MS = 30000; // 30s
const EVENT_INTERVAL_MS = 15000; // 15s

const wss = new WebSocket.Server({ port: PORT });

console.log(`🚀 Serveur WebSocket Cockpit DG (V5) sur ws://localhost:${PORT}`);
console.log('📡 Events: chantier:update, worker:gps, stock:low, payment:completed, emergency:alert\n');

let clientCount = 0;

const SAMPLE_EVENTS = [
  {
    type: 'chantier:update',
    payload: {
      chantierId: 'RENOV-042',
      sante: 0.87,
      phase: 19,
      ca: 1200000,
      updatedAt: new Date().toISOString(),
    },
  },
  {
    type: 'worker:gps',
    payload: {
      chantierId: 'RENOV-042',
      workersOnSite: 8,
      lastPosition: { lat: 14.7167, lng: -17.4677 },
      timestamp: new Date().toISOString(),
    },
  },
  {
    type: 'stock:low',
    payload: {
      chantierId: 'REPAR-015',
      product: 'peinture',
      remaining: 0.02,
      threshold: 0.1,
      timestamp: new Date().toISOString(),
    },
  },
  {
    type: 'payment:completed',
    payload: {
      chantierId: 'RENOV-038',
      amount: 500000,
      method: 'orange_money',
      reference: 'OM-' + Date.now(),
      timestamp: new Date().toISOString(),
    },
  },
  {
    type: 'cockpit_alert',
    payload: {
      severity: 'warning',
      title: 'Stock peinture bas',
      chantierId: 'REPAR-009',
      message: 'Commander avant 48h',
      timestamp: new Date().toISOString(),
    },
  },
  {
    type: 'emergency:alert',
    payload: {
      severity: 'critical',
      title: 'Alerte chantier',
      chantierId: 'RENOV-005',
      message: 'Incident sécurité signalé',
      timestamp: new Date().toISOString(),
    },
  },
  {
    type: 'cockpit_stats',
    payload: {
      totalChantiers: 20,
      actifs: 18,
      alertes: 2,
      timestamp: new Date().toISOString(),
    },
  },
];

wss.on('connection', (ws, req) => {
  const clientId = ++clientCount;
  console.log(`✅ [Client ${clientId}] Connecté (actifs: ${wss.clients.size})`);

  ws.send(
    JSON.stringify({
      type: 'connection',
      payload: { status: 'connected', clientId, message: 'Cockpit DG V5' },
      timestamp: new Date().toISOString(),
    })
  );

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ping') {
        ws.send(
          JSON.stringify({
            type: 'pong',
            payload: { timestamp: Date.now() },
            timestamp: new Date().toISOString(),
          })
        );
      }
    } catch (e) {
      // ignore
    }
  });

  ws.on('close', () => {
    console.log(`❌ [Client ${clientId}] Déconnecté (actifs: ${wss.clients.size})`);
  });

  ws.on('error', () => {});

  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, PING_INTERVAL_MS);

const broadcastEvents = setInterval(() => {
  if (wss.clients.size === 0) return;
  const ev = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
  const message = {
    type: ev.type,
    payload: ev.payload,
    timestamp: new Date().toISOString(),
  };
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (e) {}
    }
  });
  console.log(`📡 ${ev.type} → ${wss.clients.size} client(s)`);
}, EVENT_INTERVAL_MS);

process.on('SIGINT', () => {
  clearInterval(heartbeat);
  clearInterval(broadcastEvents);
  wss.clients.forEach((ws) => ws.close(1000, 'Server shutdown'));
  wss.close(() => process.exit(0));
});
