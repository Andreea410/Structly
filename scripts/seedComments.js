import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import Comment from "../models/Comment.js";
import DataStructure from "../models/DataStructure.js";

dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URI || "your fallback URI";

async function seedComments() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const dataStructures = await DataStructure.find({}, "_id").lean();
  if (dataStructures.length === 0) {
    console.error("No data structures found. Seed them first.");
    process.exit(1);
  }

  const fakeComments = [];
  for (let i = 0; i < 100000; i++) {
    const randomStructure = faker.helpers.arrayElement(dataStructures);
    fakeComments.push({
      text: faker.lorem.sentence(),
      dataStructure: randomStructure._id,
    });
  }

  await Comment.insertMany(fakeComments);
  console.log("Inserted 100,000 comments");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

seedComments().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
