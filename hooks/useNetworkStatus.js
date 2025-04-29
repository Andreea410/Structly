// /hooks/useNetworkStatus.js
import { useState, useEffect } from "react";

export default function useNetworkStatus() {
  const [networkOnline, setNetworkOnline] = useState(true);
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    const checkNetwork = () => setNetworkOnline(navigator.onLine);
    window.addEventListener("online", checkNetwork);
    window.addEventListener("offline", checkNetwork);
    checkNetwork();

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/ping");
        setServerOnline(res.ok);
      } catch {
        setServerOnline(false);
      }
    }, 5000);

    return () => {
      window.removeEventListener("online", checkNetwork);
      window.removeEventListener("offline", checkNetwork);
      clearInterval(interval);
    };
  }, []);

  return { networkOnline, serverOnline };
}
