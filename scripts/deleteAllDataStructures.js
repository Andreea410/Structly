import mongoose from "mongoose";
import dotenv from "dotenv";
import DataStructure from "../models/DataStructure.js";

dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URI || "your fallback URI";

async function deleteAllDocuments() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const result = await DataStructure.deleteMany({});
  console.log(`Deleted ${result.deletedCount} documents`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

deleteAllDocuments().catch((err) => {
  console.error("Delete error:", err);
  process.exit(1);
});
