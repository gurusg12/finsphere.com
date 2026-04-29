import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { requireUser } from "@/lib/auth";

// Profit & Loss = Income - Expense + Loan interest receipts
export async function GET(req) {
  const r = await requireUser(); if (r.error) return r.error;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"); const to = searchParams.get("to");
  await dbConnect();
  const q = {};
  if (from || to) q.date = {};
  if (from) q.date.$gte = new Date(from);
  if (to) { const d = new Date(to); d.setHours(23,59,59,999); q.date.$lte = d; }
  const txs = await Transaction.find(q).lean();
  const income = txs.filter(t => ["income","repay_int"].includes(t.type)).reduce((s,t)=>s+t.amt,0);
  const expense = txs.filter(t => t.type === "expense").reduce((s,t)=>s+t.amt,0);
  const commission = txs.filter(t => t.commission).reduce((s,t)=>s+(t.commission||0),0);
  const incomeRows = txs.filter(t => ["income","repay_int"].includes(t.type));
  const expenseRows = txs.filter(t => t.type === "expense");
  return NextResponse.json({
    income, expense, commission,
    netProfit: income - expense - commission,
    incomeRows, expenseRows,
  });
}
