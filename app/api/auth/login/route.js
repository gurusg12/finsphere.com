import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { checkPw, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await dbConnect();
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !user.active) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (!(await checkPw(password, user.password))) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const res = NextResponse.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    return setAuthCookie(res, signToken(user));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
