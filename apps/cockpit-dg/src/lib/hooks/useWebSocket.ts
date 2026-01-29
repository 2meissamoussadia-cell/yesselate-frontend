'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = WS_URL,
    autoConnect = true,
    reconnect = true,
  } = options;

  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socket = io(url, {
      autoConnect: autoConnect ?? true,
      reconnection: reconnect ?? true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, autoConnect, reconnect]);

  const on = useCallback(<T = unknown>(event: string, handler: (data: T) => void) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event: string) => {
    socketRef.current?.off(event);
  }, []);

  const emit = useCallback(<T = unknown>(event: string, data?: T) => {
    socketRef.current?.emit(event, data);
  }, []);

  return {
    socket: socketRef.current,
    connected,
    on,
    off,
    emit,
  };
}

export interface PhaseChangedEvent {
  chantierId: string;
  newPhase: number;
  timestamp: number;
}
