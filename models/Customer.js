import mongoose from "mongoose";
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: String,
  address: String,
  idProof: String,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
