import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import DataStructure from "../models/DataStructure"; 

const MONGO_URI = process.env.MONGO_URI || "your mongodb connection string here";

async function seedDatabase() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const fakeData = [];

  for (let i = 0; i < 100000; i++) {
    fakeData.push({
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      usageCount: faker.datatype.number({ min: 0, max: 500 }),
      createdAt: faker.date.past(2), 
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
