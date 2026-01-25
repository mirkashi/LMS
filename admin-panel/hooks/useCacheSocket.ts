/**
 * Custom hook for real-time cache notifications via Socket.IO
 */

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface CacheEvent {
  type: string;
  timestamp: string;
  admin: string;
  types?: string[];
}

export function useCacheSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastEvent, setLastEvent] = useState<CacheEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Initialize Socket.IO connection
    const socketInstance = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Cache socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Cache socket disconnected');
      setIsConnected(false);
    });

    // Cache cleared event
    socketInstance.on('cache:cleared', (data: CacheEvent) => {
      console.log('🗑️ Cache cleared:', data);
      setLastEvent(data);
      
      // Show notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Cache Cleared', {
            body: `${data.type} cache has been cleared`,
            icon: '/favicon.ico',
          });
        }
      }
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return {
    socket,
    isConnected,
    lastEvent,
  };
}
