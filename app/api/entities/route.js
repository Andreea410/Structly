import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/dbConnect";
import DataStructure from "../../../models/DataStructure";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const filter = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const entities = await DataStructure.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ usageCount: -1 }); 

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

    const created = await DataStructure.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /entities error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
