"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Plus } from "lucide-react";
import { fmtCur, fmtDate } from "@/lib/format";

export default function HandoversPage() {
  const [list, setList] = useState([]);
  const [agents, setAgents] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ agentId:"", amount:"", ledgerId:"", notes:"" });

  async function load() {
    const [h,a,l] = await Promise.all([fetch("/api/handovers"),fetch("/api/agents"),fetch("/api/ledgers")]);
    setList((await h.json()).handovers); setAgents((await a.json()).agents); setLedgers((await l.json()).ledgers);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    const res = await fetch("/api/handovers", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    if (res.ok) { setOpen(false); setForm({agentId:"",amount:"",ledgerId:"",notes:""}); load(); }
    else alert((await res.json()).error);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-header">Agent Handovers</h1>
        <button onClick={()=>setOpen(true)} className="btn-primary"><Plus size={16}/> New Handover</button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {agents.map(a => (
          <div key={a._id} className="card">
            <div className="font-semibold">{a.name}</div>
            <div className="text-xs text-gray-500">Cash holding</div>
            <div className="text-2xl font-bold text-warning">{fmtCur(a.holding)}</div>
            <div className="text-xs text-gray-400 mt-1">Commission: {a.commissionPct}%</div>
          </div>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-2">History</h2>
        <table className="table">
          <thead><tr><th>Date</th><th>Agent</th><th className="text-right">Amount</th><th className="text-right">Commission</th><th className="text-right">Net</th><th>Ledger</th><th>Notes</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={7} className="text-center text-gray-400 py-6">No handovers yet</td></tr>}
            {list.map(h => (
              <tr key={h._id}>
                <td>{fmtDate(h.date)}</td>
                <td>{h.agent?.name}</td>
                <td className="text-right">{fmtCur(h.amount)}</td>
                <td className="text-right text-warning">{fmtCur(h.commission)}</td>
                <td className="text-right font-semibold">{fmtCur(h.netReceived)}</td>
                <td>{h.ledger?.name || "—"}</td>
                <td className="text-sm text-gray-500">{h.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={()=>setOpen(false)} title="New Handover">
        <form onSubmit={save} className="space-y-3">
          <div><label className="label">Agent *</label>
            <select className="input" required value={form.agentId} onChange={e=>setForm({...form,agentId:e.target.value})}>
              <option value="">Select agent</option>
              {agents.map(a => <option key={a._id} value={a._id}>{a.name} (holds {fmtCur(a.holding)})</option>)}
            </select></div>
          <div><label className="label">Amount Collected *</label><input type="number" step="0.01" className="input" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></div>
          <div><label className="label">Deposit to Ledger</label>
            <select className="input" value={form.ledgerId} onChange={e=>setForm({...form,ledgerId:e.target.value})}>
              <option value="">Office Cash</option>
              {ledgers.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select></div>
          <div><label className="label">Notes</label><input className="input" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
          <button className="btn-primary w-full">Record Handover</button>
        </form>
      </Modal>
    </div>
  );
}
