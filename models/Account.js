import mongoose from "mongoose";
const AccountSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  accNo: { type: String, required: true },
  name: { type: String, required: true },     // copy of account-type name
  group: { type: String, required: true },    // group name
  type: { type: String, required: true },     // account-type name
  balance: { type: Number, default: 0 },
  principal: { type: Number, default: 0 },
  interestRate: { type: Number, default: 0 },
  durationMonths: { type: Number, default: 0 },
  openedOn: { type: Date, default: Date.now },
  maturityOn: Date,
  isLoan: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "closed"], default: "active" },
}, { timestamps: true });
export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
