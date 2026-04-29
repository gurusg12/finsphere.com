import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPw, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password too short" }, { status: 400 });
    await dbConnect();
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const count = await User.countDocuments();
    const role = count === 0 ? "admin" : "agent"; // first user = admin
    const user = await User.create({ name, email: email.toLowerCase(), password: await hashPw(password), role });
    const res = NextResponse.json({ user: { id: user._id, name, email, role } });
    return setAuthCookie(res, signToken(user));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
