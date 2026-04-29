"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { fmtCur } from "@/lib/format";

export default function MasterPage() {
  const [tab, setTab] = useState("groups");
  const tabs = [{ id:"groups", label:"Groups" }, { id:"types", label:"Account Types" }, { id:"ledgers", label:"Ledgers" }];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-header">Master Data</h1>
      <div className="flex gap-2 border-b">
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2 font-medium ${tab===t.id?"border-b-2 border-primary text-primary":"text-gray-500"}`}>{t.label}</button>
        ))}
      </div>
      {tab === "groups" && <Groups/>}
      {tab === "types" && <Types/>}
      {tab === "ledgers" && <Ledgers/>}
    </div>
  );
}

function Groups() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name:"", type:"Asset" });
  async function load() { setList((await (await fetch("/api/groups")).json()).groups); }
  useEffect(()=>{load();},[]);
  async function add(e) { e.preventDefault(); await fetch("/api/groups",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}); setForm({name:"",type:"Asset"}); load(); }
  async function del(id) { if(!confirm("Delete group?"))return; await fetch("/api/groups",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); load(); }
  return (
    <div className="space-y-3">
      <form onSubmit={add} className="card flex gap-2 items-end">
        <div className="flex-1"><label className="label">Group name</label><input className="input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
        <div><label className="label">Type</label>
          <select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
            <option>Asset</option><option>Liability</option><option>Equity</option><option>Income</option><option>Expense</option>
          </select></div>
        <button className="btn-primary"><Plus size={16}/> Add</button>
      </form>
      <div className="card overflow-x-auto"><table className="table">
        <thead><tr><th>Name</th><th>Type</th><th></th></tr></thead><tbody>
        {list.map(g => <tr key={g._id}><td>{g.name}</td><td><span className="badge bg-gray-100">{g.type}</span></td><td className="text-right"><button onClick={()=>del(g._id)} className="btn-danger btn-sm"><Trash2 size={12}/></button></td></tr>)}
        {list.length===0 && <tr><td colSpan={3} className="text-center text-gray-400 py-4">No groups</td></tr>}
        </tbody></table></div>
    </div>
  );
}

function Types() {
  const [list, setList] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name:"", group:"", isLoan:false, hasInterest:false, interestRate:0, hasDuration:false, defaultDuration:0 });
  async function load() {
    setList((await (await fetch("/api/account-types")).json()).types);
    setGroups((await (await fetch("/api/groups")).json()).groups);
  }
  useEffect(()=>{load();},[]);
  async function add(e) { e.preventDefault(); await fetch("/api/account-types",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}); setForm({name:"",group:"",isLoan:false,hasInterest:false,interestRate:0,hasDuration:false,defaultDuration:0}); load(); }
  async function del(id) { if(!confirm("Delete?"))return; await fetch("/api/account-types",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); load(); }
  return (
    <div className="space-y-3">
      <form onSubmit={add} className="card grid md:grid-cols-2 gap-3">
        <div><label className="label">Name *</label><input className="input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
        <div><label className="label">Group *</label>
          <select className="input" required value={form.group} onChange={e=>setForm({...form,group:e.target.value})}>
            <option value="">Select group</option>
            {groups.map(g => <option key={g._id} value={g.name}>{g.name} ({g.type})</option>)}
          </select></div>
        <div className="flex items-center gap-2"><input type="checkbox" checked={form.isLoan} onChange={e=>setForm({...form,isLoan:e.target.checked})}/><span>Is Loan</span></div>
        <div className="flex items-center gap-2"><input type="checkbox" checked={form.hasInterest} onChange={e=>setForm({...form,hasInterest:e.target.checked})}/><span>Has Interest</span></div>
        <div><label className="label">Interest Rate %</label><input type="number" step="0.01" className="input" value={form.interestRate} onChange={e=>setForm({...form,interestRate:+e.target.value})}/></div>
        <div><label className="label">Default Duration (months)</label><input type="number" className="input" value={form.defaultDuration} onChange={e=>setForm({...form,defaultDuration:+e.target.value})}/></div>
        <div className="md:col-span-2"><button className="btn-primary w-full"><Plus size={16}/> Add Account Type</button></div>
      </form>
      <div className="card overflow-x-auto"><table className="table">
        <thead><tr><th>Name</th><th>Group</th><th>Loan</th><th>Interest</th><th>Duration</th><th></th></tr></thead><tbody>
        {list.map(t => <tr key={t._id}><td>{t.name}</td><td>{t.group}</td><td>{t.isLoan?"Yes":"No"}</td><td>{t.interestRate}%</td><td>{t.defaultDuration} mo</td><td className="text-right"><button onClick={()=>del(t._id)} className="btn-danger btn-sm"><Trash2 size={12}/></button></td></tr>)}
        {list.length===0 && <tr><td colSpan={6} className="text-center text-gray-400 py-4">No types</td></tr>}
        </tbody></table></div>
    </div>
  );
}

function Ledgers() {
  const [list, setList] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name:"", group:"", balance:0, isCash:false });
  async function load() {
    setList((await (await fetch("/api/ledgers")).json()).ledgers);
    setGroups((await (await fetch("/api/groups")).json()).groups);
  }
  useEffect(()=>{load();},[]);
  async function add(e) { e.preventDefault(); await fetch("/api/ledgers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}); setForm({name:"",group:"",balance:0,isCash:false}); load(); }
  async function del(id) { if(!confirm("Delete?"))return; await fetch("/api/ledgers",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); load(); }
  return (
    <div className="space-y-3">
      <form onSubmit={add} className="card grid md:grid-cols-4 gap-3 items-end">
        <div><label className="label">Name *</label><input className="input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
        <div><label className="label">Group *</label>
          <select className="input" required value={form.group} onChange={e=>setForm({...form,group:e.target.value})}>
            <option value="">Select</option>
            {groups.map(g => <option key={g._id} value={g.name}>{g.name}</option>)}
          </select></div>
        <div><label className="label">Opening Balance</label><input type="number" step="0.01" className="input" value={form.balance} onChange={e=>setForm({...form,balance:+e.target.value})}/></div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={form.isCash} onChange={e=>setForm({...form,isCash:e.target.checked})}/><span>Is Cash</span></label>
          <button className="btn-primary"><Plus size={16}/></button>
        </div>
      </form>
      <div className="card overflow-x-auto"><table className="table">
        <thead><tr><th>Name</th><th>Group</th><th>Cash?</th><th className="text-right">Balance</th><th></th></tr></thead><tbody>
        {list.map(l => <tr key={l._id}><td>{l.name}</td><td>{l.group}</td><td>{l.isCash?"Yes":"No"}</td><td className="text-right font-semibold">{fmtCur(l.balance)}</td><td className="text-right"><button onClick={()=>del(l._id)} className="btn-danger btn-sm"><Trash2 size={12}/></button></td></tr>)}
        {list.length===0 && <tr><td colSpan={5} className="text-center text-gray-400 py-4">No ledgers</td></tr>}
        </tbody></table></div>
    </div>
  );
}
