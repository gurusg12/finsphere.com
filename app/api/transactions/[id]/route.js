import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import Ledger from "@/models/Ledger";
import Group from "@/models/Group";
import { requireAdmin } from "@/lib/auth";
import { getTxMod, secondaryDelta } from "@/lib/txLogic";

// Reversal-on-delete keeps balances consistent
export async function DELETE(_req, { params }) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const t = await Transaction.findById(params.id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (t.account) {
    const acc = await Account.findById(t.account);
    if (acc) {
      const grp = await Group.findOne({ name: acc.group }).lean();
      acc.balance -= t.amt * getTxMod(grp, t.type);
      await acc.save();
    }
  }
  if (t.ledger) {
    const led = await Ledger.findById(t.ledger);
    if (led && !(t.by === "agent" && t.type !== "agent_handover")) {
      led.balance -= secondaryDelta(t.type, t.amt);
      await led.save();
    }
  }
  await Transaction.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
