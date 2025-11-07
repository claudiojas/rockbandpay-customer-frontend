/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

export const useWebSocket = (url: string | null, onMessage: (data: any) => void) => {
  const ws = useRef<WebSocket | null>(null);

  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!url) {
      return;
    }

    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        // Silencioso
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current(data);
        } catch (error:unknown) {
          console.log("useWebSocket", error)
        }
      };

      ws.current.onclose = () => {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    // Limpeza
    return () => {
      clearTimeout(reconnectTimer);
      if (ws.current) {
        ws.current.onclose = null; 
        ws.current.close();
      }
    };
  }, [url]);
};
