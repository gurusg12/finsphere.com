import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Group from "@/models/Group";
import { requireAdmin, requireUser } from "@/lib/auth";

export async function GET() {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const groups = await Group.find().sort({ type: 1, name: 1 }).lean();
  return NextResponse.json({ groups });
}
export async function POST(req) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const body = await req.json();
  const g = await Group.create(body);
  return NextResponse.json({ group: g });
}
export async function DELETE(req) {
  const r = await requireAdmin(); if (r.error) return r.error;
  const { id } = await req.json();
  await dbConnect();
  await Group.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
