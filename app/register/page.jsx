"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setErr(""); setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { const j = await res.json(); setErr(j.error); return; }
    router.push("/dashboard"); router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-header to-sidebar p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-header mb-1">Create account</h1>
        <p className="text-gray-500 mb-6">First user becomes Admin automatically.</p>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Name</label><input className="input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div><label className="label">Password (6+ chars)</label><input className="input" type="password" required minLength={6} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
          {err && <div className="text-danger text-sm">{err}</div>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account? <Link href="/login" className="text-primary font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
