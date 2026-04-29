"use client";
import { useEffect, useState } from "react";
import { ProfitLossReport, BalanceSheetReport, PrintActions } from "@/components/ReportGenerator";
import { fmtCur, fmtDate, fmtDateTime, todayISO } from "@/lib/format";
import { useRef } from "react";

export default function ReportsPage() {
  const [tab, setTab] = useState("daybook");
  const tabs = [
    { id:"daybook", label:"Day Book" },
    { id:"balance-book", label:"Balance Book" },
    { id:"ledger", label:"Ledger" },
    { id:"loans", label:"Loans" },
    { id:"pl", label:"Profit & Loss" },
    { id:"bs", label:"Balance Sheet" },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-header">Reports</h1>
      <div className="flex gap-2 border-b overflow-x-auto no-print">
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2 font-medium whitespace-nowrap ${tab===t.id?"border-b-2 border-primary text-primary":"text-gray-500"}`}>{t.label}</button>
        ))}
      </div>
      {tab === "daybook" && <DayBook/>}
      {tab === "balance-book" && <BalanceBook/>}
      {tab === "ledger" && <LedgerReport/>}
      {tab === "loans" && <LoansReport/>}
      {tab === "pl" && <PL/>}
      {tab === "bs" && <BS/>}
    </div>
  );
}

function DateRange({ value, onChange }) {
  return (
    <div className="card flex flex-wrap gap-3 items-end no-print">
      <div><label className="label">From</label><input type="date" className="input" value={value.from} onChange={e=>onChange({...value,from:e.target.value})}/></div>
      <div><label className="label">To</label><input type="date" className="input" value={value.to} onChange={e=>onChange({...value,to:e.target.value})}/></div>
    </div>
  );
}

function DayBook() {
  const [range, setRange] = useState({ from: todayISO(), to: todayISO() });
  const [rows, setRows] = useState([]);
  const ref = useRef();
  async function load() {
    const qs = new URLSearchParams(range).toString();
    setRows((await (await fetch("/api/reports/daybook?"+qs)).json()).transactions);
  }
  useEffect(()=>{ load(); },[range]);
  const total = rows.reduce((s,t)=>s+t.amt,0);
  return (
    <>
      <DateRange value={range} onChange={setRange}/>
      <div className="card">
        <div className="flex justify-between mb-2"><h2 className="font-semibold">Day Book</h2><PrintActions targetRef={ref} filename="daybook.pdf"/></div>
        <div ref={ref} className="bg-white p-4">
          <h1 className="text-xl font-bold text-center mb-3">Day Book — {range.from} to {range.to}</h1>
          <table className="table"><thead><tr><th>Date</th><th>Type</th><th>Customer/Account</th><th>Ledger</th><th className="text-right">Amount</th></tr></thead><tbody>
            {rows.map(t => (
              <tr key={t._id}>
                <td>{fmtDateTime(t.date)}</td><td>{t.type}</td>
                <td>{t.account?.customer?.name||"—"} <small>{t.account?.name}</small></td>
                <td>{t.ledger?.name||"—"}</td>
                <td className="text-right">{fmtCur(t.amt)}</td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={5} className="text-center text-gray-400 py-4">No data</td></tr>}
            <tr className="font-bold bg-gray-50"><td colSpan={4}>Total</td><td className="text-right">{fmtCur(total)}</td></tr>
          </tbody></table>
        </div>
      </div>
    </>
  );
}

function BalanceBook() {
  const [data, setData] = useState({ accounts: [], ledgers: [] });
  const ref = useRef();
  useEffect(()=>{ (async()=>setData(await (await fetch("/api/reports/balance-book")).json()))(); },[]);
  const totalAcc = data.accounts.reduce((s,a)=>s+a.balance,0);
  const totalLed = data.ledgers.reduce((s,l)=>s+l.balance,0);
  return (
    <div className="card">
      <div className="flex justify-between mb-2"><h2 className="font-semibold">Balance Book</h2><PrintActions targetRef={ref} filename="balance-book.pdf"/></div>
      <div ref={ref} className="bg-white p-4 space-y-4">
        <h1 className="text-xl font-bold text-center">Balance Book</h1>
        <div>
          <h3 className="font-semibold bg-gray-100 p-2">Customer Accounts</h3>
          <table className="table"><thead><tr><th>Customer</th><th>Account</th><th>Group</th><th className="text-right">Balance</th></tr></thead><tbody>
            {data.accounts.map(a => <tr key={a._id}><td>{a.customer?.name}</td><td>{a.name} ({a.accNo})</td><td>{a.group}</td><td className="text-right">{fmtCur(a.balance)}</td></tr>)}
            <tr className="font-bold bg-gray-50"><td colSpan={3}>Total</td><td className="text-right">{fmtCur(totalAcc)}</td></tr>
          </tbody></table>
        </div>
        {data.ledgers.length > 0 && <div>
          <h3 className="font-semibold bg-gray-100 p-2">Ledgers</h3>
          <table className="table"><thead><tr><th>Ledger</th><th>Group</th><th className="text-right">Balance</th></tr></thead><tbody>
            {data.ledgers.map(l => <tr key={l._id}><td>{l.name}</td><td>{l.group}</td><td className="text-right">{fmtCur(l.balance)}</td></tr>)}
            <tr className="font-bold bg-gray-50"><td colSpan={2}>Total</td><td className="text-right">{fmtCur(totalLed)}</td></tr>
          </tbody></table>
        </div>}
      </div>
    </div>
  );
}

function LedgerReport() {
  const [accounts, setAccounts] = useState([]);
  const [accId, setAccId] = useState("");
  const [range, setRange] = useState({ from:"", to: todayISO() });
  const [data, setData] = useState(null);
  const ref = useRef();
  useEffect(()=>{ (async()=>setAccounts((await (await fetch("/api/accounts")).json()).accounts))(); },[]);
  async function run() {
    if (!accId) return;
    const qs = new URLSearchParams({account:accId, ...range}).toString();
    setData(await (await fetch("/api/reports/ledger?"+qs)).json());
  }
  useEffect(()=>{ run(); }, [accId, range]);
  return (
    <>
      <div className="card flex flex-wrap gap-3 items-end no-print">
        <div className="flex-1 min-w-[200px]"><label className="label">Account</label>
          <select className="input" value={accId} onChange={e=>setAccId(e.target.value)}>
            <option value="">Select</option>
            {accounts.map(a => <option key={a._id} value={a._id}>{a.customer?.name} — {a.name}</option>)}
          </select></div>
        <div><label className="label">From</label><input type="date" className="input" value={range.from} onChange={e=>setRange({...range,from:e.target.value})}/></div>
        <div><label className="label">To</label><input type="date" className="input" value={range.to} onChange={e=>setRange({...range,to:e.target.value})}/></div>
      </div>
      {data && data.account && (
        <div className="card">
          <div className="flex justify-between mb-2"><h2 className="font-semibold">Ledger — {data.account.name}</h2><PrintActions targetRef={ref} filename="ledger.pdf"/></div>
          <div ref={ref} className="bg-white p-4">
            <h1 className="text-xl font-bold text-center">Ledger Report</h1>
            <p className="text-center text-sm">{data.account.customer?.name} — {data.account.name} ({data.account.accNo})</p>
            <table className="table mt-3"><thead><tr><th>Date</th><th>Type</th><th>Remarks</th><th className="text-right">Impact</th><th className="text-right">Running</th></tr></thead><tbody>
              <tr className="bg-gray-50"><td colSpan={4}>Opening Balance</td><td className="text-right">{fmtCur(data.opening)}</td></tr>
              {data.rows.map(t => <tr key={t._id}><td>{fmtDate(t.date)}</td><td>{t.type}</td><td>{t.remarks}</td><td className={`text-right ${t.impact>=0?"text-green-600":"text-red-600"}`}>{fmtCur(t.impact)}</td><td className="text-right">{fmtCur(t.running)}</td></tr>)}
              <tr className="font-bold bg-gray-50"><td colSpan={4}>Closing Balance</td><td className="text-right">{fmtCur(data.closing)}</td></tr>
            </tbody></table>
          </div>
        </div>
      )}
    </>
  );
}

function LoansReport() {
  const [loans, setLoans] = useState([]);
  const ref = useRef();
  useEffect(()=>{ (async()=>setLoans((await (await fetch("/api/reports/loans")).json()).loans))(); },[]);
  return (
    <div className="card">
      <div className="flex justify-between mb-2"><h2 className="font-semibold">Loans</h2><PrintActions targetRef={ref} filename="loans.pdf"/></div>
      <div ref={ref} className="bg-white p-4">
        <h1 className="text-xl font-bold text-center mb-3">Loan Accounts</h1>
        <table className="table"><thead><tr><th>Customer</th><th>A/c No</th><th>Type</th><th>Principal</th><th>Rate</th><th>Opened</th><th>Maturity</th><th className="text-right">Outstanding</th></tr></thead><tbody>
          {loans.map(l => <tr key={l._id}><td>{l.customer?.name}</td><td>{l.accNo}</td><td>{l.name}</td><td>{fmtCur(l.principal)}</td><td>{l.interestRate}%</td><td>{fmtDate(l.openedOn)}</td><td>{l.maturityOn?fmtDate(l.maturityOn):"—"}</td><td className="text-right font-semibold">{fmtCur(l.balance)}</td></tr>)}
          {loans.length===0 && <tr><td colSpan={8} className="text-center text-gray-400 py-4">No loans</td></tr>}
        </tbody></table>
      </div>
    </div>
  );
}

function PL() {
  const [range, setRange] = useState({ from:"", to: todayISO() });
  const [data, setData] = useState(null);
  useEffect(()=>{ (async()=>{
    const qs = new URLSearchParams(range).toString();
    setData(await (await fetch("/api/reports/pl?"+qs)).json());
  })(); },[range]);
  return (<><DateRange value={range} onChange={setRange}/><ProfitLossReport data={data} from={range.from} to={range.to}/></>);
}

function BS() {
  const [data, setData] = useState(null);
  useEffect(()=>{ (async()=>setData(await (await fetch("/api/reports/balance-sheet")).json()))(); },[]);
  return <BalanceSheetReport data={data}/>;
}
