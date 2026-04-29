import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Account from "@/models/Account";
import { requireAdmin, requireUser } from "@/lib/auth";

export async function GET(_req, { params }) {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const a = await Account.findById(params.id).populate("customer").lean();
  return NextResponse.json({ account: a });
}
export async function PUT(req, { params }) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const a = await Account.findByIdAndUpdate(params.id, await req.json(), { new: true });
  return NextResponse.json({ account: a });
}
export async function DELETE(_req, { params }) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  await Account.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
