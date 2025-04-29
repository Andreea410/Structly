import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

  dataStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DataStructure",
    required: true
  }
});

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);
