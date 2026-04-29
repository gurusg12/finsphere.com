import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Ledger from "@/models/Ledger";
import { requireAdmin, requireUser } from "@/lib/auth";

export async function GET() {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const ledgers = await Ledger.find().sort({ name: 1 }).lean();
  return NextResponse.json({ ledgers });
}
export async function POST(req) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const l = await Ledger.create(await req.json());
  return NextResponse.json({ ledger: l });
}
export async function DELETE(req) {
  const r = await requireAdmin(); if (r.error) return r.error;
  const { id } = await req.json();
  await dbConnect();
  await Ledger.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
