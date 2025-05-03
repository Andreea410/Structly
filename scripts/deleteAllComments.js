import mongoose from "mongoose";
import dotenv from "dotenv";
import Comment from "../models/Comment.js";

dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URI || "your fallback URI";

async function deleteAllComments() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const result = await Comment.deleteMany({});
  console.log(`Deleted ${result.deletedCount} comments`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

deleteAllComments().catch((err) => {
  console.error("Delete error:", err);
  process.exit(1);
});
