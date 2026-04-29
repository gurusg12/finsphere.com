import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { dbConnect } from "./mongodb";
import User from "@/models/User";

const SECRET = process.env.JWT_SECRET || "dev-secret";
const COOKIE = "fs_token";

export async function hashPw(pw) { return bcrypt.hash(pw, 10); }
export async function checkPw(pw, hash) { return bcrypt.compare(pw, hash); }

export function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name },
    SECRET,
    { expiresIn: "7d" }
  );
}

export function setAuthCookie(res, token) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export function clearAuthCookie(res) {
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

export async function getSessionUser() {
  try {
    const c = cookies().get(COOKIE);
    if (!c) return null;
    const payload = jwt.verify(c.value, SECRET);
    await dbConnect();
    const u = await User.findById(payload.id).lean();
    if (!u) return null;
    return { id: u._id.toString(), name: u.name, email: u.email, role: u.role, assigned: (u.assigned || []).map(String) };
  } catch { return null; }
}

export async function requireUser() {
  const u = await getSessionUser();
  if (!u) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { user: u };
}

export async function requireAdmin() {
  const r = await requireUser();
  if (r.error) return r;
  if (r.user.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return r;
}
