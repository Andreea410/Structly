import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  dataStructure: { type: mongoose.Schema.Types.ObjectId, ref: 'DataStructure', required: true }, 
}, { timestamps: true });

commentSchema.index({ dataStructure: 1 });
export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);
