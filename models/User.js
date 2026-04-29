import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "agent"], default: "agent" },
  mobile: String,
  // For agents: Account ObjectIds they may operate on
  assigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  commissionPct: { type: Number, default: 0 }, // % commission on collections
  active: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.models.User || mongoose.model("User", UserSchema);
