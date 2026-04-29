import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req, { params }) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  const body = await req.json();
  delete body.password; delete body.role;
  const u = await User.findByIdAndUpdate(params.id, body, { new: true }).select("-password");
  return NextResponse.json({ agent: u });
}
export async function DELETE(_req, { params }) {
  const r = await requireAdmin(); if (r.error) return r.error;
  await dbConnect();
  await User.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
