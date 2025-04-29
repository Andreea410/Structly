import mongoose from "mongoose";

const paragraphSchema = new mongoose.Schema({
  text: String,
  link: {
    type: { type: String },
    url: String
  }
});

const dataStructureSchema = new mongoose.Schema({
  title: String,
  description: String,
  usageCount: { type: Number, default: 0 },
  paragraphs: [paragraphSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
});

export default mongoose.models.DataStructure || mongoose.model("DataStructure", dataStructureSchema);
