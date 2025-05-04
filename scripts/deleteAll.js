import mongoose from "mongoose";
import dotenv from "dotenv";
import DataStructure from "../models/DataStructure.js";
import Comment from "../models/Comment.js";

dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URI;

async function deleteAllDocumentsFast() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const structures = await DataStructure.find({}, "_id");
  const ids = structures.map(ds => ds._id);

  const commentResult = await Comment.deleteMany({ dataStructure: { $in: ids } });
  console.log(`Deleted ${commentResult.deletedCount} comments`);

  const dsResult = await DataStructure.deleteMany({ _id: { $in: ids } });
  console.log(`Deleted ${dsResult.deletedCount} data structures`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

deleteAllDocumentsFast().catch((err) => {
  console.error("Delete error:", err);
  process.exit(1);
});
