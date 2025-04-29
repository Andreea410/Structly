import { generateFakeDataStructures } from "../utils/generateFakeData.js";
import { addEntity } from "./dataStore.js"; // Save to your in-memory store
import { io } from "./setupWebSocket.js";   // Exported io instance

let interval;

export function startEntityGeneration(ms = 10000) {
  if (!io) {
    console.error("WebSocket not initialized");
    return;
  }

  if (interval) clearInterval(interval);

  interval = setInterval(() => {
    const [newEntity] = generateFakeDataStructures(1);

    // Save entity to datastore
    addEntity(newEntity);

    // Broadcast via WebSocket
    io.emit("NEW_ENTITY", newEntity);
    console.log("Auto-generated entity:", newEntity.title);
  }, ms);
}
