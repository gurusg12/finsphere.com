"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Wallet, ArrowLeftRight, UserCog, HandCoins,
  Database, FileBarChart, Settings, Menu, X
} from "lucide-react";

const adminNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/agents", label: "Agents", icon: UserCog },
  { href: "/handovers", label: "Agent Handovers", icon: HandCoins },
  { href: "/master", label: "Master Data", icon: Database },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];
const agentNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "My Customers", icon: Users },
  { href: "/accounts", label: "My Accounts", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = user.role === "admin" ? adminNav : agentNav;
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 bg-header text-white p-2 rounded-md no-print">
        <Menu size={20} />
      </button>
      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}
      <aside className={`fixed md:static z-50 md:z-auto inset-y-0 left-0 w-64 bg-sidebar text-white flex flex-col transform ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform no-print`}>
        <div className="h-14 flex items-center justify-between px-5 bg-header font-bold text-lg">
          <span>FinSphere</span>
          <button className="md:hidden" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-5 py-3 border-b border-white/10 hover:bg-white/5 transition ${active ? "bg-white/10 border-l-4 border-l-primary" : ""}`}>
                <Icon size={18} /><span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-xs text-white/60 border-t border-white/10">
          v1.0 · {user.role.toUpperCase()}
        </div>
      </aside>
    </>
  );
}
