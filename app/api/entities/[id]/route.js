import { NextResponse } from 'next/server';
import { getEntityById, updateEntity, deleteEntity } from '../../../../lib/dataStore.js';
import { validateEntity } from '../../../../lib/validation.js';
import { getWebSocketManager } from '../../../../lib/websocketServer.js';

export async function GET(req, context) {
  const { id } = await context.params; // Awaiting context.params
  const entity = getEntityById(id);

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  return NextResponse.json(entity, { status: 200 });
}

export async function PATCH(req, context) {
  const { id } = await context.params; // Awaiting context.params
  const updates = await req.json();
  const wsManager = getWebSocketManager();

  const errors = validateEntity(updates);
  if (errors.length) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const existing = getEntityById(id);
  if (!existing) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const updated = updateEntity(id, updates);
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (wsManager) {
    wsManager.broadcast({
      type: 'ENTITY_UPDATED',
      data: updated
    });
  }

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(req, context) {
  const { id } = await context.params; // Awaiting context.params
  const entity = getEntityById(id);
  const wsManager = getWebSocketManager();

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  deleteEntity(id);

  if (wsManager) {
    wsManager.broadcast({
      type: 'ENTITY_DELETED',
      data: { id }
    });
  }

  return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
}
