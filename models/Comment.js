import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  dataStructure: { type: mongoose.Schema.Types.ObjectId, ref: 'DataStructure', required: true }, 
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);
