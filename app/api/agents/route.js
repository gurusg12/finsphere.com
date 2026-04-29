import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { requireAdmin } from "@/lib/auth";
import { hashPw } from "@/lib/auth";

export async function GET() {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const agents = await User.find({ role: "agent" }).select("-password").lean();
  // Compute current cash held by each agent (deposits collected - handovers)
  const txs = await Transaction.find({ user: { $in: agents.map(a => a._id) } }).lean();
  const enriched = agents.map(a => {
    const my = txs.filter(t => String(t.user) === String(a._id));
    const collected = my
      .filter(t => ["deposit", "repay_princ", "repay_int"].includes(t.type) && t.by === "agent")
      .reduce((s, t) => s + t.amt, 0);
    const handed = my.filter(t => t.type === "agent_handover").reduce((s, t) => s + t.amt, 0);
    return { ...a, holding: collected - handed };
  });
  return NextResponse.json({ agents: enriched });
}

export async function POST(req) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const { name, email, password, mobile, commissionPct, assigned } = await req.json();
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return NextResponse.json({ error: "Email taken" }, { status: 409 });
  const u = await User.create({
    name, email: email.toLowerCase(), password: await hashPw(password || "agent123"),
    mobile, role: "agent", commissionPct: Number(commissionPct || 0), assigned: assigned || [],
  });
  return NextResponse.json({ agent: { id: u._id, name: u.name } });
}
