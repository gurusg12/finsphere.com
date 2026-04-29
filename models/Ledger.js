import mongoose from "mongoose";
// Ledger = a Cash/Bank/Office account NOT belonging to a customer.
const LedgerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "Office Cash", "HDFC Bank"
  group: { type: String, required: true },              // group name
  balance: { type: Number, default: 0 },
  isCash: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.models.Ledger || mongoose.model("Ledger", LedgerSchema);
