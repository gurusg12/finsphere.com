import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import Ledger from "@/models/Ledger";
import Group from "@/models/Group";
import { requireUser } from "@/lib/auth";
import { getTxMod, secondaryDelta } from "@/lib/txLogic";

export async function GET(req) {
  const r = await requireUser(); if (r.error) return r.error;
  const { searchParams } = new URL(req.url);
  const account = searchParams.get("account");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");
  await dbConnect();
  const q = {};
  if (account) q.account = account;
  if (type) q.type = type;
  if (from || to) q.date = {};
  if (from) q.date.$gte = new Date(from);
  if (to) { const d = new Date(to); d.setHours(23,59,59,999); q.date.$lte = d; }
  if (r.user.role === "agent") {
    q.$or = [{ account: { $in: r.user.assigned } }, { user: r.user.id }];
  }
  const txs = await Transaction.find(q)
    .populate({ path: "account", populate: { path: "customer", select: "name mobile" } })
    .populate("ledger")
    .populate("user", "name role")
    .sort({ date: -1, createdAt: -1 })
    .limit(500)
    .lean();
  return NextResponse.json({ transactions: txs });
}

export async function POST(req) {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const body = await req.json();
  const amt = Number(body.amt);
  if (!amt || amt <= 0) return NextResponse.json({ error: "Amount required" }, { status: 400 });
  if (!body.type) return NextResponse.json({ error: "Type required" }, { status: 400 });

  const isAgent = r.user.role === "agent";
  let primaryAcc = null;
  if (body.account) {
    primaryAcc = await Account.findById(body.account);
    if (!primaryAcc) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    if (isAgent && !r.user.assigned.includes(String(primaryAcc._id))) {
      return NextResponse.json({ error: "Account not assigned to you" }, { status: 403 });
    }
  }
  // Update primary account balance
  if (primaryAcc) {
    const grp = await Group.findOne({ name: primaryAcc.group }).lean();
    const mod = getTxMod(grp, body.type);
    primaryAcc.balance += amt * mod;
    await primaryAcc.save();
  }

  // Secondary side: ledger
  let ledger = null;
  if (body.ledger) {
    ledger = await Ledger.findById(body.ledger);
    if (ledger) {
      // For agent-recorded deposits, money doesn't hit ledger until handover.
      if (!(isAgent && body.type !== "agent_handover")) {
        ledger.balance += secondaryDelta(body.type, amt);
        await ledger.save();
      }
    }
  }

  const receiptNo = `R${Date.now().toString().slice(-8)}`;
  const tx = await Transaction.create({
    date: body.date ? new Date(body.date) : new Date(),
    type: body.type,
    amt,
    account: primaryAcc ? primaryAcc._id : undefined,
    ledger: ledger ? ledger._id : undefined,
    mode: body.mode || "cash",
    remarks: body.remarks || "",
    by: isAgent ? "agent" : "admin",
    user: r.user.id,
    receiptNo,
  });

  const populated = await Transaction.findById(tx._id)
    .populate({ path: "account", populate: { path: "customer" } })
    .populate("ledger").populate("user", "name").lean();
  return NextResponse.json({ transaction: populated });
}
