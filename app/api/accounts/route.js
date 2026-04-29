import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Account from "@/models/Account";
import AccountType from "@/models/AccountType";
import { requireUser } from "@/lib/auth";

export async function GET(req) {
  const r = await requireUser(); if (r.error) return r.error;
  const { searchParams } = new URL(req.url);
  const customer = searchParams.get("customer");
  await dbConnect();
  const filter = {};
  if (customer) filter.customer = customer;
  if (r.user.role === "agent") filter._id = { $in: r.user.assigned };
  const accounts = await Account.find(filter).populate("customer", "name mobile").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ accounts });
}

export async function POST(req) {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const body = await req.json();
  const at = await AccountType.findOne({ name: body.type }).lean();
  if (!at) return NextResponse.json({ error: "Account type not found" }, { status: 400 });
  const opened = body.openedOn ? new Date(body.openedOn) : new Date();
  let maturityOn;
  const dur = Number(body.durationMonths || at.defaultDuration || 0);
  if (dur > 0) {
    maturityOn = new Date(opened);
    maturityOn.setMonth(maturityOn.getMonth() + dur);
  }
  const acc = await Account.create({
    customer: body.customer,
    accNo: body.accNo,
    name: at.name,
    group: at.group,
    type: at.name,
    balance: Number(body.balance || 0),
    principal: Number(body.principal || 0),
    interestRate: Number(body.interestRate || at.interestRate || 0),
    durationMonths: dur,
    openedOn: opened,
    maturityOn,
    isLoan: !!at.isLoan,
  });
  return NextResponse.json({ account: acc });
}
