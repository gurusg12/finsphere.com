import mongoose from "mongoose";
const TransactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String, required: true }, // deposit / withdraw / disburse / repay_princ / repay_int / income / expense / agent_handover
  amt: { type: Number, required: true },
  // Primary side (customer account)
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  // Secondary side: either a Ledger or another Account; we use ledger by default
  ledger: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },
  mode: { type: String, default: "cash" }, // cash / bank / online / cheque
  remarks: String,
  by: { type: String, enum: ["admin", "agent"], default: "admin" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who recorded it
  // For agent_handover only
  handoverFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  commission: { type: Number, default: 0 },
  receiptNo: String,
}, { timestamps: true });
export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
