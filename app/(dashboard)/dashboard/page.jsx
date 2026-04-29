import { dbConnect } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import Customer from "@/models/Customer";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { fmtCur, fmtDateTime } from "@/lib/format";
import Link from "next/link";
import { Users, Wallet, TrendingUp, ArrowLeftRight } from "lucide-react";

export default async function Dashboard() {
  const user = await getSessionUser();
  await dbConnect();
  const accFilter = user.role === "agent" ? { _id: { $in: user.assigned } } : {};
  const accounts = await Account.find(accFilter).lean();
  const customerIds = [...new Set(accounts.map(a => String(a.customer)))];
  const totalCustomers = user.role === "agent"
    ? customerIds.length
    : await Customer.countDocuments();
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const txQ = user.role === "agent"
    ? { $or: [{ account: { $in: user.assigned } }, { user: user.id }] }
    : {};
  const recent = await Transaction.find(txQ)
    .populate({ path: "account", populate: { path: "customer", select: "name" } })
    .sort({ date: -1, createdAt: -1 }).limit(10).lean();
  const txCount = await Transaction.countDocuments(txQ);

  const cards = [
    { label: "Customers", val: totalCustomers, icon: Users, color: "bg-blue-500" },
    { label: "Accounts", val: accounts.length, icon: Wallet, color: "bg-emerald-500" },
    { label: "Total Balance", val: fmtCur(totalBalance), icon: TrendingUp, color: "bg-amber-500" },
    { label: "Transactions", val: txCount, icon: ArrowLeftRight, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-header">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="card flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${c.color}`}>
              <c.icon size={22}/>
            </div>
            <div>
              <div className="text-xs text-gray-500">{c.label}</div>
              <div className="text-lg font-bold">{c.val}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Recent Activity</h2>
          <Link href="/transactions" className="text-primary text-sm">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Date</th><th>Type</th><th>Customer / Account</th><th className="text-right">Amount</th></tr></thead>
            <tbody>
              {recent.length === 0 && <tr><td colSpan={4} className="text-center text-gray-400 py-6">No transactions yet</td></tr>}
              {recent.map(t => (
                <tr key={t._id}>
                  <td>{fmtDateTime(t.date)}</td>
                  <td><span className="badge bg-gray-100">{t.type}</span></td>
                  <td>{t.account?.customer?.name || "—"} <small className="text-gray-400">{t.account?.name || ""}</small></td>
                  <td className="text-right font-semibold">{fmtCur(t.amt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
