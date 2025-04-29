import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/dbConnect";
import Comment from "../../../models/Comment";

export async function POST(req) {
  await dbConnect();
  const { text, dataStructureId } = await req.json();

  if (!text || !dataStructureId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const comment = await Comment.create({ text, dataStructure: dataStructureId });
  return NextResponse.json(comment, { status: 201 });
}

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const dataStructureId = searchParams.get("dataStructureId");

  const comments = await Comment.find({ dataStructure: dataStructureId }).sort({ createdAt: -1 });
  return NextResponse.json(comments);
}
