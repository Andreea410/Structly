import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/dbConnect";
import DataStructure from "/models/DataStructure";
import { getCurrentUser } from '../../../lib/auth'; 
import { validateEntity } from '../../../lib/validation';
import { logAction } from '../../../../lib/logger'; // ✅ Add this

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortOption = searchParams.get("sort") || "default";
    const skip = (page - 1) * limit;

    const filter = search ? { 
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    } : {};

    let sort = {};
    if (sortOption === "name-asc") {
      sort = { title: 1 };
    } else if (sortOption === "name-desc") {
      sort = { title: -1 };
    } else if (sortOption === "most-used") {
      sort = { usageCount: -1 };
    } else if (sortOption === "least-used") {
      sort = { usageCount: 1 };
    } else if (sortOption === "newest") {
      sort = { createdAt: -1 };
    } else if (sortOption === "oldest") {
      sort = { createdAt: 1 };
    }

    const entities = await DataStructure.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

      try {
        const currentUser = await getCurrentUser(req);
        for (const entity of entities) {
          await logAction({
            userId: currentUser._id,
            action: "READ",
            entity: "DataStructure",
            entityId: entity._id
          });
        }
      } catch (_) {
        
      }

    return NextResponse.json(entities, { status: 200 });
  } catch (err) {
    console.error("GET /entities error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const currentUser = await getCurrentUser(req);

    const entityData = {
      ...body,
      createdBy: currentUser._id
    };

    const errors = validateEntity(entityData);
    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const created = await DataStructure.create(entityData);

    await logAction({
      userId: currentUser._id,
      action: "CREATE",
      entity: "DataStructure",
      entityId: created._id
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /entities error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}



