// /services/offlineQueueService.js
const KEY = "offlineQueue";

export function queueOperation(op) {
  const queue = JSON.parse(localStorage.getItem(KEY) || "[]");
  queue.push(op);
  localStorage.setItem(KEY, JSON.stringify(queue));
}

export async function processQueue() {
  const queue = JSON.parse(localStorage.getItem(KEY) || "[]");
  const successful = [];

  for (const op of queue) {
    try {
      await fetch(op.url, {
        method: op.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op.body),
      });
      successful.push(op);
    } catch (err) {
      console.warn("Retry failed:", op, err);
    }
  }

  const remaining = queue.filter(op => !successful.includes(op));
  localStorage.setItem(KEY, JSON.stringify(remaining));
}
