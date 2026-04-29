import mongoose from "mongoose";
const SettingsSchema = new mongoose.Schema({
  orgName: { type: String, default: "FinSphere" },
  orgAddress: String,
  orgPhone: String,
  currency: { type: String, default: "₹" },
  receiptFooter: { type: String, default: "Thank you for banking with us" },
}, { timestamps: true });
export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
