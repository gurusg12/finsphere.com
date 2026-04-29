import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import Group from "@/models/Group";
import { requireUser } from "@/lib/auth";
import { getTxMod } from "@/lib/txLogic";

export async function GET(req) {
  const r = await requireUser(); if (r.error) return r.error;
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("account");
  const from = searchParams.get("from"); const to = searchParams.get("to");
  if (!accountId) return NextResponse.json({ error: "account required" }, { status: 400 });
  await dbConnect();
  const acc = await Account.findById(accountId).populate("customer").lean();
  if (!acc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (r.user.role === "agent" && !r.user.assigned.includes(String(acc._id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const grp = await Group.findOne({ name: acc.group }).lean();
  const q = { account: accountId };
  if (from || to) q.date = {};
  if (from) q.date.$gte = new Date(from);
  if (to) { const d = new Date(to); d.setHours(23,59,59,999); q.date.$lte = d; }
  const txs = await Transaction.find(q).sort({ date: 1 }).lean();
  let running = 0;
  // Compute opening: sum of all txs strictly before "from"
  if (from) {
    const before = await Transaction.find({ account: accountId, date: { $lt: new Date(from) } }).lean();
    running = before.reduce((s, t) => s + t.amt * getTxMod(grp, t.type), 0);
  }
  const opening = running;
  const rows = txs.map(t => {
    const impact = t.amt * getTxMod(grp, t.type);
    running += impact;
    return { ...t, impact, running };
  });
  return NextResponse.json({ account: acc, opening, rows, closing: running });
}
