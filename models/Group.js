import mongoose from "mongoose";
const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ["Asset", "Liability", "Equity", "Income", "Expense"], required: true },
}, { timestamps: true });
export default mongoose.models.Group || mongoose.model("Group", GroupSchema);
