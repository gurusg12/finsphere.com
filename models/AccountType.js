import mongoose from "mongoose";
// Dynamic config for an account "type" (Savings, Loan, RD, etc.)
const AccountTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  group: { type: String, required: true }, // group name (Asset / Liability / ...)
  hasInterest: { type: Boolean, default: false },
  interestRate: { type: Number, default: 0 }, // % p.a.
  hasDuration: { type: Boolean, default: false }, // months
  defaultDuration: { type: Number, default: 0 },
  isLoan: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.models.AccountType || mongoose.model("AccountType", AccountTypeSchema);
