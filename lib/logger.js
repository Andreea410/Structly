// lib/logger.js
import Log from "../models/Log.js";

export async function logAction({ userId, action, entity, entityId }) {
  try {
    await Log.create({ userId, action, entity, entityId });
  } catch (err) {
    console.error("Log creation failed:", err);
  }
}
