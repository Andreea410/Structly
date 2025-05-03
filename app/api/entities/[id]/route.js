import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/dbConnect';
import DataStructure from '../../../../models/DataStructure';
import { validateEntity } from '../../../../lib/validation';
import { getWebSocketManager } from '../../../../lib/websocketServer';

export async function GET(req, context) {
  const { id } = await context.params;

  await dbConnect();

  if (!id || id === "undefined") {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const entity = await DataStructure.findById(id).populate("comments");
    if (!entity) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }

    const entityObject = entity.toObject();
    entityObject.id = entity._id;
    return NextResponse.json(entityObject);
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Error fetching entity" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const updates = await req.json();
    const wsManager = getWebSocketManager();

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const entity = await DataStructure.findById(id);
    if (!entity) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser(req); 
    if (currentUser.role !== "admin" && entity.createdBy.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const errors = validateEntity(updates);
    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const updated = await DataStructure.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (wsManager) {
      wsManager.broadcast({ type: 'ENTITY_UPDATED', data: updated });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Error updating entity" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const wsManager = getWebSocketManager();

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const entity = await DataStructure.findById(id);
    if (!entity) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser(req); 
    if (currentUser.role !== "admin" && entity.createdBy.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await DataStructure.findByIdAndDelete(id);

    if (wsManager) {
      wsManager.broadcast({ type: 'ENTITY_DELETED', data: { id } });
    }

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Error deleting entity" }, { status: 500 });
  }
}

