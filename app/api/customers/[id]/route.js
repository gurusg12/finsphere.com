import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { requireAdmin, requireUser } from "@/lib/auth";

export async function GET(_req, { params }) {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const c = await Customer.findById(params.id).lean();
  return NextResponse.json({ customer: c });
}
export async function PUT(req, { params }) {
  const r = await requireUser(); if (r.error) return r.error;
  await dbConnect();
  const body = await req.json();
  const c = await Customer.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ customer: c });
}
export async function DELETE(_req, { params }) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  await Customer.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
