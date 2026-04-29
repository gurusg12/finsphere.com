import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import AccountType from "@/models/AccountType";
import { requireAdmin, requireUser } from "@/lib/auth";

export async function GET() {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const types = await AccountType.find().sort({ name: 1 }).lean();
  return NextResponse.json({ types });
}
export async function POST(req) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const t = await AccountType.create(await req.json());
  return NextResponse.json({ type: t });
}
export async function DELETE(req) {
  const r = await requireAdmin(); if (r.error) return r.error;
  const { id } = await req.json();
  await dbConnect();
  await AccountType.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
