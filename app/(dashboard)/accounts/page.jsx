"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Plus, Trash2 } from "lucide-react";
import { fmtCur, fmtDate, todayISO } from "@/lib/format";

export default function AccountsPage() {
  const [list, setList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [types, setTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  async function load() {
    const [a,c,t] = await Promise.all([fetch("/api/accounts"), fetch("/api/customers"), fetch("/api/account-types")]);
    setList((await a.json()).accounts); setCustomers((await c.json()).customers); setTypes((await t.json()).types);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setForm({ customer: "", type: "", accNo: "A" + Date.now().toString().slice(-6), balance: 0, principal: 0, interestRate: 0, durationMonths: 0, openedOn: todayISO() });
    setOpen(true);
  }
  function onTypeChange(name) {
    const t = types.find(x => x.name === name);
    setForm({ ...form, type: name, interestRate: t?.interestRate || 0, durationMonths: t?.defaultDuration || 0 });
  }
  async function save(e) {
    e.preventDefault();
    const res = await fetch("/api/accounts", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    if (res.ok) { setOpen(false); load(); }
  }
  async function del(a) {
    if (!confirm(`Delete account ${a.accNo}?`)) return;
    await fetch(`/api/accounts/${a._id}`, { method: "DELETE" }); load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-header">Accounts</h1>
        <button onClick={openNew} className="btn-primary"><Plus size={16}/> New Account</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>A/c No</th><th>Customer</th><th>Type</th><th>Group</th><th>Opened</th><th>Maturity</th><th className="text-right">Balance</th><th></th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={8} className="text-center text-gray-400 py-6">No accounts yet</td></tr>}
            {list.map(a => (
              <tr key={a._id}>
                <td className="font-mono">{a.accNo}</td>
                <td>{a.customer?.name}</td>
                <td>{a.name}</td>
                <td><span className="badge bg-gray-100">{a.group}</span></td>
                <td>{fmtDate(a.openedOn)}</td>
                <td>{a.maturityOn ? fmtDate(a.maturityOn) : "—"}</td>
                <td className="text-right font-semibold">{fmtCur(a.balance)}</td>
                <td className="text-right"><button onClick={() => del(a)} className="btn-danger btn-sm"><Trash2 size={12}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="New Account">
        <form onSubmit={save} className="space-y-3">
          <div><label className="label">Customer *</label>
            <select className="input" required value={form.customer||""} onChange={e=>setForm({...form,customer:e.target.value})}>
              <option value="">Select customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select></div>
          <div><label className="label">Account Type *</label>
            <select className="input" required value={form.type||""} onChange={e=>onTypeChange(e.target.value)}>
              <option value="">Select type</option>
              {types.map(t => <option key={t._id} value={t.name}>{t.name} ({t.group})</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">A/c Number</label><input className="input" required value={form.accNo||""} onChange={e=>setForm({...form,accNo:e.target.value})}/></div>
            <div><label className="label">Opening Balance</label><input className="input" type="number" step="0.01" value={form.balance||0} onChange={e=>setForm({...form,balance:+e.target.value})}/></div>
            <div><label className="label">Principal (Loans)</label><input className="input" type="number" value={form.principal||0} onChange={e=>setForm({...form,principal:+e.target.value})}/></div>
            <div><label className="label">Interest %</label><input className="input" type="number" step="0.01" value={form.interestRate||0} onChange={e=>setForm({...form,interestRate:+e.target.value})}/></div>
            <div><label className="label">Duration (months)</label><input className="input" type="number" value={form.durationMonths||0} onChange={e=>setForm({...form,durationMonths:+e.target.value})}/></div>
            <div><label className="label">Opened On</label><input className="input" type="date" value={form.openedOn||""} onChange={e=>setForm({...form,openedOn:e.target.value})}/></div>
          </div>
          <button className="btn-primary w-full">Create Account</button>
        </form>
      </Modal>
    </div>
  );
}
