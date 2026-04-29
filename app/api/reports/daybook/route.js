import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { requireUser } from "@/lib/auth";

export async function GET(req) {
  const r = await requireUser(); if (r.error) return r.error;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"); const to = searchParams.get("to");
  await dbConnect();
  const q = {};
  if (from || to) q.date = {};
  if (from) q.date.$gte = new Date(from);
  if (to) { const d = new Date(to); d.setHours(23,59,59,999); q.date.$lte = d; }
  if (r.user.role === "agent") q.user = r.user.id;
  const txs = await Transaction.find(q)
    .populate({ path: "account", populate: { path: "customer", select: "name" } })
    .populate("ledger", "name")
    .sort({ date: 1 }).lean();
  return NextResponse.json({ transactions: txs });
}
