import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/dbConnect';
import Comment from '../../../models/Comment';
import DataStructure from '../../../models/DataStructure';

export async function POST(req) {
  try {
    await dbConnect();

    const { text, dataStructureId } = await req.json();

    if (!text || !dataStructureId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const comment = await Comment.create({
      text,
      dataStructure: dataStructureId
    });

    await DataStructure.findByIdAndUpdate(
      dataStructureId,
      { $push: { comments: comment._id } },
      { new: true }
    );

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("POST /comments error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
