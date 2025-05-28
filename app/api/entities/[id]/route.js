import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/dbConnect';
import DataStructure from '../../../../models/DataStructure';
import { validateEntity } from '../../../../lib/validation';
import { getWebSocketManager } from '../../../../lib/websocketServer';
import { getCurrentUser } from '../../../../lib/auth'; 
import { logAction } from '../../../../lib/logger'; 

// GET /api/entities/:id
export async function GET(req, { params }) {
  try {
    const id = await params.id;

    await dbConnect();

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const entity = await DataStructure.findById(id).populate("comments");
    if (!entity) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }

    const entityObject = entity.toObject();
    entityObject.id = entity._id;

    let currentUser = null;
    try {
      currentUser = await getCurrentUser(req);
    } catch (e) {
    }

    if (currentUser) {
      await logAction({
        userId: String(currentUser._id),
        action: "READ",
        entity: "DataStructure",
        entityId: entity._id,
      });
    }

    return NextResponse.json(entityObject);
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: err.message || "Error fetching entity" }, { status: 500 });
  }
}

// PATCH /api/entities/:id
export async function PATCH(req, { params }) {
  try {
    const id = await params.id;
    await dbConnect();
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
    const isOnlyUsageUpdate = Object.keys(updates).length === 1 && typeof updates.usageCount === "number";

    if (
      !currentUser?._id ||
      (!isOnlyUsageUpdate &&
        (!entity.createdBy || (currentUser.role !== "admin" && entity.createdBy.toString() !== currentUser._id.toString()))
      )
    ) {
      return NextResponse.json({ error: "You are not allowed to modify this data structure." }, { status: 403 });
    }

    if (!isOnlyUsageUpdate) {
      const errors = validateEntity(updates);
      if (errors.length) {
        return NextResponse.json({ errors }, { status: 400 });
      }
    }

    const updated = await DataStructure.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (wsManager) {
      wsManager.broadcast({ type: 'ENTITY_UPDATED', data: updated });
    }

    await logAction({
      userId: String(currentUser._id),
      action: "UPDATE",
      entity: "DataStructure",
      entityId: updated._id
    });    

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json({ error: err.message || "Error updating entity" }, { status: 500 });
  }
}


// DELETE /api/entities/:id
export async function DELETE(req, { params }) {
  try {
    const id = await params.id;
    await dbConnect();
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
      return NextResponse.json({ error: "You are not allowed to modify this data structure." }, { status: 403 });
    }

    await DataStructure.findByIdAndDelete(id);

    if (wsManager) {
      wsManager.broadcast({ type: 'ENTITY_DELETED', data: { id } });
    }

    await logAction({
      userId: String(currentUser._id),
      action: "DELETE",
      entity: "DataStructure",
      entityId: entity._id
    });
    
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: err.message || "Error deleting entity" }, { status: 500 });
  }
}
