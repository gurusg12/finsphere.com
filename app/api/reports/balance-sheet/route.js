import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Account from "@/models/Account";
import Ledger from "@/models/Ledger";
import Group from "@/models/Group";
import Transaction from "@/models/Transaction";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const groups = await Group.find().lean();
  const groupMap = Object.fromEntries(groups.map(g => [g.name, g.type]));
  const accounts = await Account.find().populate("customer", "name").lean();
  const ledgers = await Ledger.find().lean();

  const buckets = { Asset: [], Liability: [], Equity: [], Income: [], Expense: [] };
  for (const a of accounts) {
    const t = groupMap[a.group] || "Asset";
    buckets[t].push({ name: `${a.customer?.name || "?"} — ${a.name}`, balance: a.balance, group: a.group });
  }
  for (const l of ledgers) {
    const t = groupMap[l.group] || "Asset";
    buckets[t].push({ name: l.name, balance: l.balance, group: l.group });
  }

  // P&L → equity
  const txs = await Transaction.find().lean();
  const income = txs.filter(t => ["income","repay_int"].includes(t.type)).reduce((s,t)=>s+t.amt,0);
  const expense = txs.filter(t => t.type === "expense").reduce((s,t)=>s+t.amt,0);
  const netProfit = income - expense;

  const totalAssets = buckets.Asset.reduce((s,x)=>s+x.balance,0);
  const totalLiab = buckets.Liability.reduce((s,x)=>s+x.balance,0);
  const totalEquity = buckets.Equity.reduce((s,x)=>s+x.balance,0) + netProfit;

  return NextResponse.json({ buckets, netProfit, totalAssets, totalLiab, totalEquity });
}
