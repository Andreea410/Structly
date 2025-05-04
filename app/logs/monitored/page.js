"use client";

import { useEffect, useState } from "react";

export default function MonitoredUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMonitored = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/monitored-users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!res.ok) throw new Error("Failed to fetch monitored users");
  
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchMonitored();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Monitored Users</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {users.length === 0 ? (
        <p>No suspicious users detected.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user._id} className="border p-4 rounded-lg shadow">
              <p><strong>Email:</strong> {user.userId?.email || "Unknown"}</p>
              <p><strong>Reason:</strong> {user.reason}</p>
              <p><strong>Detected:</strong> {new Date(user.detectedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
