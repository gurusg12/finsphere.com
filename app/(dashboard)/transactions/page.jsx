"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import Receipt from "@/components/Receipt";
import { Plus, Trash2, Receipt as RIcon } from "lucide-react";
import { fmtCur, fmtDateTime, todayISO } from "@/lib/format";
import { TX_TYPES } from "@/lib/txLogic";

export default function TransactionsPage() {
  const [list, setList] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [filter, setFilter] = useState({ from: "", to: "", type: "" });

  function emptyForm() {
    return { date: todayISO(), type: "deposit", account: "", ledger: "", amt: "", mode: "cash", remarks: "" };
  }

  async function load() {
    const qs = new URLSearchParams(Object.entries(filter).filter(([_,v]) => v)).toString();
    const [tx, ac, le] = await Promise.all([
      fetch("/api/transactions" + (qs ? "?" + qs : "")),
      fetch("/api/accounts"),
      fetch("/api/ledgers"),
    ]);
    setList((await tx.json()).transactions);
    setAccounts((await ac.json()).accounts);
    const lj = await le.json(); setLedgers(lj.ledgers || []);
  }
  useEffect(() => { load(); }, [filter]);

  // Filter transaction types based on selected account (loan accounts get loan-specific types)
  const selectedAcc = accounts.find(a => a._id === form.account);
  const allowedTypes = selectedAcc?.isLoan
    ? TX_TYPES.filter(t => ["disburse","repay_princ","repay_int"].includes(t.value))
    : TX_TYPES.filter(t => !["agent_handover"].includes(t.value));

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/transactions", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ...form, amt: Number(form.amt) }) });
    if (!res.ok) { alert((await res.json()).error); return; }
    const j = await res.json();
    setOpen(false); setForm(emptyForm()); load();
    setReceipt(j.transaction);
  }
  async function del(t) {
    if (!confirm("Reverse and delete this transaction?")) return;
    await fetch(`/api/transactions/${t._id}`, { method: "DELETE" }); load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-header">Transactions</h1>
        <button onClick={() => { setForm(emptyForm()); setOpen(true); }} className="btn-primary"><Plus size={16}/> New Transaction</button>
      </div>

      <div className="card flex flex-wrap gap-3 items-end">
        <div><label className="label">From</label><input type="date" className="input" value={filter.from} onChange={e=>setFilter({...filter,from:e.target.value})}/></div>
        <div><label className="label">To</label><input type="date" className="input" value={filter.to} onChange={e=>setFilter({...filter,to:e.target.value})}/></div>
        <div><label className="label">Type</label>
          <select className="input" value={filter.type} onChange={e=>setFilter({...filter,type:e.target.value})}>
            <option value="">All</option>{TX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select></div>
        <button onClick={() => setFilter({from:"",to:"",type:""})} className="btn-outline">Clear</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Date</th><th>Type</th><th>Customer / Account</th><th>Ledger</th><th>Mode</th><th className="text-right">Amount</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={7} className="text-center text-gray-400 py-6">No transactions</td></tr>}
            {list.map(t => (
              <tr key={t._id}>
                <td className="whitespace-nowrap">{fmtDateTime(t.date)}</td>
                <td><span className="badge bg-gray-100">{t.type}</span></td>
                <td>{t.account?.customer?.name || "—"} <small className="text-gray-400">{t.account?.name}</small></td>
                <td>{t.ledger?.name || "—"}</td>
                <td>{t.mode}</td>
                <td className="text-right font-semibold">{fmtCur(t.amt)}</td>
                <td className="text-right whitespace-nowrap">
                  <button onClick={() => setReceipt(t)} className="btn-info btn-sm"><RIcon size={12}/></button>
                  <button onClick={() => del(t)} className="btn-danger btn-sm"><Trash2 size={12}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Transaction" size="lg">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Date</label><input type="date" className="input" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
            <div><label className="label">Account *</label>
              <select className="input" required value={form.account} onChange={e=>setForm({...form,account:e.target.value, type: ""})}>
                <option value="">Select account</option>
                {accounts.map(a => <option key={a._id} value={a._id}>{a.customer?.name} — {a.name} ({a.accNo})</option>)}
              </select></div>
            <div><label className="label">Type *</label>
              <select className="input" required value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                <option value="">Select type</option>
                {allowedTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select></div>
            <div><label className="label">Amount *</label><input type="number" step="0.01" min="0.01" className="input" required value={form.amt} onChange={e=>setForm({...form,amt:e.target.value})}/></div>
            <div><label className="label">Ledger (Cash/Bank)</label>
              <select className="input" value={form.ledger} onChange={e=>setForm({...form,ledger:e.target.value})}>
                <option value="">Office Cash (none)</option>
                {ledgers.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select></div>
            <div><label className="label">Mode</label>
              <select className="input" value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})}>
                <option value="cash">Cash</option><option value="bank">Bank</option>
                <option value="online">Online</option><option value="cheque">Cheque</option>
              </select></div>
          </div>
          <div><label className="label">Remarks</label><input className="input" value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})}/></div>
          <button className="btn-primary w-full">Save Transaction</button>
        </form>
      </Modal>

      {receipt && <Receipt tx={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
