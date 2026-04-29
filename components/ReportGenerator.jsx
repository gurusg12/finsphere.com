"use client";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Printer, Download } from "lucide-react";
import { fmtCur } from "@/lib/format";

export function PrintActions({ targetRef, filename = "report.pdf" }) {
  async function pdf() {
    const el = targetRef.current; if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#fff" });
    const img = canvas.toDataURL("image/jpeg", 0.95);
    const doc = new jsPDF("p", "mm", "a4");
    const w = doc.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    let pos = 0; const pageH = doc.internal.pageSize.getHeight();
    if (h <= pageH) doc.addImage(img, "JPEG", 0, 0, w, h);
    else {
      let remaining = h;
      while (remaining > 0) {
        doc.addImage(img, "JPEG", 0, pos, w, h);
        remaining -= pageH;
        if (remaining > 0) { doc.addPage(); pos -= pageH; }
      }
    }
    doc.save(filename);
  }
  return (
    <div className="flex gap-2 no-print">
      <button onClick={() => window.print()} className="btn-outline btn-sm"><Printer size={14}/> Print</button>
      <button onClick={pdf} className="btn-blue btn-sm"><Download size={14}/> PDF</button>
    </div>
  );
}

export function ProfitLossReport({ data, currency = "₹", from, to }) {
  const ref = useRef();
  if (!data) return null;
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Profit & Loss Statement</h2>
        <PrintActions targetRef={ref} filename="profit-loss.pdf" />
      </div>
      <div ref={ref} className="bg-white p-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Profit & Loss Statement</h1>
          {(from || to) && <p className="text-sm text-gray-500">{from || "—"} to {to || "—"}</p>}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2 bg-gray-100 p-2">Income</h3>
            <table className="table">
              <tbody>
                {data.incomeRows.map((t,i) => (
                  <tr key={i}><td>{t.type === "repay_int" ? "Loan Interest" : "Income"} — {t.remarks || ""}</td><td className="text-right">{fmtCur(t.amt, currency)}</td></tr>
                ))}
                <tr className="font-bold bg-gray-50"><td>Total Income</td><td className="text-right">{fmtCur(data.income, currency)}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-semibold mb-2 bg-gray-100 p-2">Expenses</h3>
            <table className="table">
              <tbody>
                {data.expenseRows.map((t,i) => (
                  <tr key={i}><td>Expense — {t.remarks || ""}</td><td className="text-right">{fmtCur(t.amt, currency)}</td></tr>
                ))}
                {data.commission > 0 && (
                  <tr><td>Agent Commission</td><td className="text-right">{fmtCur(data.commission, currency)}</td></tr>
                )}
                <tr className="font-bold bg-gray-50"><td>Total Expenses</td><td className="text-right">{fmtCur(data.expense + data.commission, currency)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className={`mt-6 p-4 text-center text-xl font-bold ${data.netProfit >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          Net {data.netProfit >= 0 ? "Profit" : "Loss"}: {fmtCur(Math.abs(data.netProfit), currency)}
        </div>
      </div>
    </div>
  );
}

export function BalanceSheetReport({ data, currency = "₹" }) {
  const ref = useRef();
  if (!data) return null;
  const sumBucket = (b) => b.reduce((s,x) => s + x.balance, 0);
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Balance Sheet</h2>
        <PrintActions targetRef={ref} filename="balance-sheet.pdf" />
      </div>
      <div ref={ref} className="bg-white p-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Balance Sheet</h1>
          <p className="text-sm text-gray-500">As of {new Date().toLocaleDateString()}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2 bg-blue-50 p-2">Assets</h3>
            <table className="table">
              <tbody>
                {data.buckets.Asset.map((x,i) => (
                  <tr key={i}><td>{x.name}<small className="text-gray-400 ml-1">({x.group})</small></td><td className="text-right">{fmtCur(x.balance, currency)}</td></tr>
                ))}
                <tr className="font-bold bg-gray-50"><td>Total Assets</td><td className="text-right">{fmtCur(data.totalAssets, currency)}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-semibold mb-2 bg-orange-50 p-2">Liabilities & Equity</h3>
            <table className="table">
              <tbody>
                {data.buckets.Liability.map((x,i) => (
                  <tr key={"l"+i}><td>{x.name}<small className="text-gray-400 ml-1">({x.group})</small></td><td className="text-right">{fmtCur(x.balance, currency)}</td></tr>
                ))}
                <tr className="font-semibold"><td>Total Liabilities</td><td className="text-right">{fmtCur(data.totalLiab, currency)}</td></tr>
                {data.buckets.Equity.map((x,i) => (
                  <tr key={"e"+i}><td>{x.name}<small className="text-gray-400 ml-1">({x.group})</small></td><td className="text-right">{fmtCur(x.balance, currency)}</td></tr>
                ))}
                <tr><td>Net Profit / (Loss)</td><td className="text-right">{fmtCur(data.netProfit, currency)}</td></tr>
                <tr className="font-bold bg-gray-50"><td>Total Equity</td><td className="text-right">{fmtCur(data.totalEquity, currency)}</td></tr>
                <tr className="font-bold bg-blue-50"><td>Total Liab + Equity</td><td className="text-right">{fmtCur(data.totalLiab + data.totalEquity, currency)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
