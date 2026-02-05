/**
 * Phase 4 — IoT : Capteurs (mock)
 * Page IoT & capteurs — température, humidité, équipements
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Thermometer, Droplets, Wrench, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import Link from 'next/link';

type SensorType = 'temperature' | 'humidity' | 'equipment';
type Sensor = {
  id: string;
  name: string;
  type: SensorType;
  value: number;
  unit: string;
  status: 'ok' | 'warning' | 'critical';
  lastUpdate: string;
  location?: string;
};

const MOCK_SENSORS: Sensor[] = [
  { id: 't1', name: 'Temp. bureau NICE', type: 'temperature', value: 22.5, unit: '°C', status: 'ok', lastUpdate: new Date().toISOString(), location: 'Bureau 1' },
  { id: 't2', name: 'Temp. entrepôt', type: 'temperature', value: 18.2, unit: '°C', status: 'ok', lastUpdate: new Date().toISOString(), location: 'Entrepôt' },
  { id: 'h1', name: 'Humidité chantier #042', type: 'humidity', value: 65, unit: '%', status: 'warning', lastUpdate: new Date().toISOString(), location: 'Chantier #042' },
  { id: 'e1', name: 'Groupe électrique', type: 'equipment', value: 100, unit: '%', status: 'ok', lastUpdate: new Date().toISOString(), location: 'Site A' },
  { id: 'e2', name: 'Compresseur', type: 'equipment', value: 72, unit: '%', status: 'ok', lastUpdate: new Date().toISOString(), location: 'Atelier' },
];

function SensorCard({ sensor }: { sensor: Sensor }) {
  const Icon = sensor.type === 'temperature' ? Thermometer : sensor.type === 'humidity' ? Droplets : Wrench;
  const statusClass =
    sensor.status === 'critical' ? 'border-rose-500/50 bg-rose-500/10' :
    sensor.status === 'warning' ? 'border-amber-500/50 bg-amber-500/10' :
    'border-slate-700/50 bg-slate-800/30';

  return (
    <div className={cn('rounded-xl border p-4', statusClass)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-slate-400" />
          <div>
            <p className="font-medium text-slate-200">{sensor.name}</p>
            {sensor.location && <p className="text-xs text-slate-500">{sensor.location}</p>}
          </div>
        </div>
        {sensor.status !== 'ok' && (
          <AlertCircle className={cn('h-4 w-4 shrink-0', sensor.status === 'critical' ? 'text-rose-400' : 'text-amber-400')} />
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-100">
        {sensor.value} {sensor.unit}
      </p>
      <p className="text-[10px] text-slate-500 mt-1">
        Dernière maj. : {new Date(sensor.lastUpdate).toLocaleTimeString('fr-FR')}
      </p>
    </div>
  );
}

export default function IoTPage() {
  const [sensors, setSensors] = useState<Sensor[]>(MOCK_SENSORS);

  useEffect(() => {
    const t = setInterval(() => {
      setSensors((prev) =>
        prev.map((s) => ({
          ...s,
          value: s.type === 'temperature' ? s.value + (Math.random() - 0.5) * 0.2 : s.type === 'humidity' ? s.value + (Math.random() - 0.5) * 2 : s.value,
          lastUpdate: new Date().toISOString(),
        }))
      );
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            IoT & capteurs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Phase 4 — Données mock. À terme : flux temps réel (WebSocket/MQTT), alertes, historiques.
          </p>
        </div>
        <Link href="/maitre-ouvrage/dashboard/r/pilotage/dashboard/default" className="text-sm text-sky-400 hover:text-sky-300">
          ← Dashboard
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((s) => (
          <SensorCard key={s.id} sensor={s} />
        ))}
      </div>
    </div>
  );
}
