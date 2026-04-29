import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Account from "@/models/Account";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  let customers;
  if (r.user.role === "agent") {
    const accs = await Account.find({ _id: { $in: r.user.assigned } }).select("customer").lean();
    const ids = [...new Set(accs.map(a => String(a.customer)))];
    customers = await Customer.find({ _id: { $in: ids } }).sort({ name: 1 }).lean();
  } else {
    customers = await Customer.find().sort({ name: 1 }).lean();
  }
  return NextResponse.json({ customers });
}

export async function POST(req) {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const body = await req.json();
  const c = await Customer.create({ ...body, createdBy: r.user.id });
  return NextResponse.json({ customer: c });
}
