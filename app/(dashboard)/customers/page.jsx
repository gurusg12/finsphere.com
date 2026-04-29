"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function CustomersPage() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", mobile: "", address: "", idProof: "", notes: "" });

  async function load() {
    const r = await fetch("/api/customers"); setList((await r.json()).customers);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm({ name: "", mobile: "", address: "", idProof: "", notes: "" }); setOpen(true); }
  function openEdit(c) { setEditing(c); setForm({ name: c.name, mobile: c.mobile||"", address: c.address||"", idProof: c.idProof||"", notes: c.notes||"" }); setOpen(true); }

  async function save(e) {
    e.preventDefault();
    const url = editing ? `/api/customers/${editing._id}` : "/api/customers";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: {"Content-Type":"application/json"}, body: JSON.stringify(form) });
    if (res.ok) { setOpen(false); load(); }
  }
  async function del(c) {
    if (!confirm(`Delete ${c.name}?`)) return;
    await fetch(`/api/customers/${c._id}`, { method: "DELETE" }); load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-header">Customers</h1>
        <button onClick={openNew} className="btn-primary"><Plus size={16}/> New Customer</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Name</th><th>Mobile</th><th>Address</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={4} className="text-center text-gray-400 py-6">No customers</td></tr>}
            {list.map(c => (
              <tr key={c._id}>
                <td className="font-medium">{c.name}</td>
                <td>{c.mobile}</td>
                <td className="text-sm text-gray-600">{c.address}</td>
                <td className="text-right">
                  <button onClick={() => openEdit(c)} className="btn-outline btn-sm"><Edit2 size={12}/></button>
                  <button onClick={() => del(c)} className="btn-danger btn-sm"><Trash2 size={12}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Customer" : "New Customer"}>
        <form onSubmit={save} className="space-y-3">
          <div><label className="label">Name *</label><input className="input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div><label className="label">Mobile</label><input className="input" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})}/></div>
          <div><label className="label">Address</label><input className="input" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
          <div><label className="label">ID Proof</label><input className="input" value={form.idProof} onChange={e=>setForm({...form,idProof:e.target.value})}/></div>
          <div><label className="label">Notes</label><input className="input" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
          <button className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </div>
  );
}
