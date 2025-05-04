"use client";

import { useEffect, useState } from "react";

export default function MonitoredUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/monitored-users")
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Monitored Users</h1>
      {users.length === 0 ? (
        <p>No suspicious users detected.</p>
      ) : (
        <ul className="space-y-4">
          {users.map(user => (
            <li key={user._id} className="border p-4 rounded-lg shadow">
              <p><strong>Email:</strong> {user.userId.email}</p>
              <p><strong>Reason:</strong> {user.reason}</p>
              <p><strong>Detected:</strong> {new Date(user.detectedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
