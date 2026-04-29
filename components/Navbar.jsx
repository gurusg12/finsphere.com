"use client";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";

export default function Navbar({ user }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login"); router.refresh();
  }
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 no-print">
      <div className="font-semibold text-header text-sm md:text-base ml-12 md:ml-0">Welcome, {user.name}</div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600"><UserCircle size={18}/>{user.role}</span>
        <button onClick={logout} className="btn-outline btn-sm"><LogOut size={14}/> Logout</button>
      </div>
    </header>
  );
}
