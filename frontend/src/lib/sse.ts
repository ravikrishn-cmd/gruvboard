import { useEffect, useRef, useCallback } from "react";
import type { SSEEventType } from "@/types/events";

type SSEHandler = (data: unknown) => void;

export function useEventStream(handlers: Partial<Record<SSEEventType, SSEHandler>>) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    const eventSource = new EventSource("/api/events");

    const eventTypes: SSEEventType[] = [
      "health_update",
      "metrics_update",
      "service_state_change",
      "alert",
    ];

    for (const eventType of eventTypes) {
      eventSource.addEventListener(eventType, (event: MessageEvent) => {
        const handler = handlersRef.current[eventType];
        if (handler) {
          try {
            const data = JSON.parse(event.data);
            handler(data);
          } catch {
            // ignore parse errors
          }
        }
      });
    }

    eventSource.onerror = () => {
      eventSource.close();
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    return eventSource;
  }, []);

  useEffect(() => {
    const es = connect();
    return () => es.close();
  }, [connect]);
}
