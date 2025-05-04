import Log from "../models/Log";

export async function logAction({ userId, action, entity, entityId }) {
  try {
    await Log.create({
      userId,
      action,
      entity,
      entityId,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Logging failed:", err);
  }
}
