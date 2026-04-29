import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Account from "@/models/Account";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const filter = { isLoan: true };
  if (r.user.role === "agent") filter._id = { $in: r.user.assigned };
  const loans = await Account.find(filter).populate("customer", "name mobile").lean();
  return NextResponse.json({ loans });
}
