import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const connect = () => {
    if (!socketRef.current || !socketRef.current.connected) {
      socketRef.current = io();

      socketRef.current.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected");
      });

      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
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
      
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
  };
}
