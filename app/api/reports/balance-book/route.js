import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Account from "@/models/Account";
import Ledger from "@/models/Ledger";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const accFilter = r.user.role === "agent" ? { _id: { $in: r.user.assigned } } : {};
  const accounts = await Account.find(accFilter).populate("customer", "name").lean();
  const ledgers = r.user.role === "admin" ? await Ledger.find().lean() : [];
  return NextResponse.json({ accounts, ledgers });
}
