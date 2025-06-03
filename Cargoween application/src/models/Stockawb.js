import mongoose from "mongoose";

const awbStockSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  awbType: { type: String, enum: ["Paper AWB", "EAP", "EAW"] },
  comment: { type: String }
}, { timestamps: true });

export default mongoose.models.AWBStock || mongoose.model("AWBStock", awbStockSchema);
