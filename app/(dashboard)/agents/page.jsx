"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { fmtCur } from "@/lib/format";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", password:"", mobile:"", commissionPct:0, assigned:[] });

  async function load() {
    const [a,ac] = await Promise.all([fetch("/api/agents"), fetch("/api/accounts")]);
    setAgents((await a.json()).agents); setAccounts((await ac.json()).accounts);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm({ name:"", email:"", password:"", mobile:"", commissionPct:0, assigned:[] }); setOpen(true); }
  function openEdit(a) { setEditing(a); setForm({ name:a.name, email:a.email, mobile:a.mobile||"", commissionPct:a.commissionPct||0, assigned:(a.assigned||[]).map(String) }); setOpen(true); }

  async function save(e) {
    e.preventDefault();
    const url = editing ? `/api/agents/${editing._id}` : "/api/agents";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    if (res.ok) { setOpen(false); load(); }
    else alert((await res.json()).error);
  }
  async function del(a) {
    if (!confirm(`Delete agent ${a.name}?`)) return;
    await fetch(`/api/agents/${a._id}`, { method:"DELETE" }); load();
  }
  function toggleAssign(id) {
    const has = form.assigned.includes(id);
    setForm({ ...form, assigned: has ? form.assigned.filter(x=>x!==id) : [...form.assigned, id] });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-header">Agents</h1>
        <button onClick={openNew} className="btn-primary"><Plus size={16}/> New Agent</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Commission %</th><th>Assigned</th><th className="text-right">Cash Holding</th><th></th></tr></thead>
          <tbody>
            {agents.length === 0 && <tr><td colSpan={7} className="text-center text-gray-400 py-6">No agents</td></tr>}
            {agents.map(a => (
              <tr key={a._id}>
                <td className="font-medium">{a.name}</td>
                <td>{a.email}</td>
                <td>{a.mobile}</td>
                <td>{a.commissionPct}%</td>
                <td>{(a.assigned||[]).length} accounts</td>
                <td className="text-right font-semibold">{fmtCur(a.holding)}</td>
                <td className="text-right">
                  <button onClick={()=>openEdit(a)} className="btn-outline btn-sm"><Edit2 size={12}/></button>
                  <button onClick={()=>del(a)} className="btn-danger btn-sm"><Trash2 size={12}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={()=>setOpen(false)} title={editing?"Edit Agent":"New Agent"} size="lg">
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Name *</label><input className="input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div><label className="label">Email *</label><input className="input" type="email" required disabled={!!editing} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
            {!editing && <div><label className="label">Password *</label><input className="input" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>}
            <div><label className="label">Mobile</label><input className="input" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})}/></div>
            <div><label className="label">Commission %</label><input className="input" type="number" step="0.01" value={form.commissionPct} onChange={e=>setForm({...form,commissionPct:+e.target.value})}/></div>
          </div>
          <div>
            <label className="label">Assigned Accounts</label>
            <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
              {accounts.map(a => (
                <label key={a._id} className="flex items-center gap-2 py-1">
                  <input type="checkbox" checked={form.assigned.includes(a._id)} onChange={()=>toggleAssign(a._id)}/>
                  <span className="text-sm">{a.customer?.name} — {a.name} <small className="text-gray-400">({a.accNo})</small></span>
                </label>
              ))}
              {accounts.length === 0 && <p className="text-sm text-gray-400">No accounts available</p>}
            </div>
          </div>
          <button className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </div>
  );
}
