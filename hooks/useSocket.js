import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const connect = () => {
    if (!socketRef.current || !socketRef.current.connected) {
      socketRef.current = io({
        path: "/api/socketio",
        addTrailingSlash: false,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      socketRef.current.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected");
      });

      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });

      socketRef.current.on("connect_error", (error) => {
        console.log("Socket connection error:", error);
        setIsConnected(false);
      });
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
      console.log("Socket manually disconnected");
    }
  };

  // Optional: auto-connect on mount
  useEffect(() => {
    connect(); // remove this line if you only want manual control
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
  };
}
