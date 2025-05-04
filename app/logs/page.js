// app/logs/page.jsx
"use client";
import { useEffect, useState } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error("Failed to fetch logs", err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CRUD Operation Logs</h1>
      <table className="w-full border-collapse border border-purple-200">
        <thead>
          <tr className="bg-purple-100 text-left">
            <th className="p-3 border">User</th>
            <th className="p-3 border">Action</th>
            <th className="p-3 border">Entity</th>
            <th className="p-3 border">Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td className="p-3 border">{log.user?.email || "Unknown"}</td>
              <td className="p-3 border">{log.action}</td>
              <td className="p-3 border">{log.entityId}</td>
              <td className="p-3 border">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
