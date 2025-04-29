import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/dbConnect';
import DataStructure from '../../../../models/DataStructure';
import { validateEntity } from '../../../../lib/validation';
import { getWebSocketManager } from '../../../../lib/websocketServer';

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = params;

  if (!id || id === "undefined") {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const entity = await DataStructure.findById(id).populate("comments");
    if (!entity) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }
    return NextResponse.json(entity);
  } catch (err) {
    return NextResponse.json({ error: "Error fetching entity" }, { status: 500 });
  }
}


export async function PATCH(req, { params }) {
  await dbConnect();
  const { id } = params;
  const updates = await req.json();
  const wsManager = getWebSocketManager();

  const errors = validateEntity(updates);
  if (errors.length) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const updated = await DataStructure.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    return NextResponse.json({ error: 'Update failed or entity not found' }, { status: 404 });
  }

  if (wsManager) {
    wsManager.broadcast({
      type: 'ENTITY_UPDATED',
      data: updated
    });
  }

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = params;
  const wsManager = getWebSocketManager();

  const deleted = await DataStructure.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
  }

  if (wsManager) {
    wsManager.broadcast({
      type: 'ENTITY_DELETED',
      data: { id }
    });
  }

  return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
}
