import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import DataStructure from "../models/DataStructure.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URI;

async function seedDatabase() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let user = await User.findOne({ email: "test@example.com" });
  if (!user) {
    user = await User.create({
      email: "test@example.com",
      username: "TestUser",
      password: "hashedpassword", 
      role: "user"
    });
    console.log("Created test user:", user._id);
  }

  const fakeData = [];

  for (let i = 0; i < 100000; i++) {
    fakeData.push({
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      usageCount: faker.number.int({ min: 0, max: 500 }),
      createdAt: faker.date.past(2),
      createdBy: user._id
    });
  }

  await DataStructure.insertMany(fakeData);
  console.log("Inserted 100,000 documents");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

seedDatabase().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
