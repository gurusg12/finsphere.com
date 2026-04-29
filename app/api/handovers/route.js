import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Handover from "@/models/Handover";
import Transaction from "@/models/Transaction";
import Ledger from "@/models/Ledger";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const handovers = await Handover.find().populate("agent", "name").populate("ledger", "name").sort({ date: -1 }).lean();
  return NextResponse.json({ handovers });
}

export async function POST(req) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const { agentId, amount, ledgerId, notes } = await req.json();
  const agent = await User.findById(agentId);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  const amt = Number(amount);
  const commission = +(amt * (agent.commissionPct || 0) / 100).toFixed(2);
  const net = amt - commission;
  const ledger = ledgerId ? await Ledger.findById(ledgerId) : null;
  if (ledger) { ledger.balance += net; await ledger.save(); }

  const tx = await Transaction.create({
    type: "agent_handover", amt: net, ledger: ledger?._id, by: "agent",
    user: agent._id, handoverFrom: agent._id, commission,
    remarks: notes || `Handover from ${agent.name}`,
  });
  const h = await Handover.create({
    agent: agent._id, amount: amt, commission, netReceived: net,
    ledger: ledger?._id, transaction: tx._id, notes,
  });
  return NextResponse.json({ handover: h });
}
