"use client";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { Printer, Image as ImageIcon, MessageCircle } from "lucide-react";
import { fmtCur, fmtDateTime } from "@/lib/format";

export default function Receipt({ tx, org = {}, onClose }) {
  const ref = useRef(null);
  if (!tx) return null;

  const cust = tx.account?.customer;
  const typeLabels = {
    deposit: "DEPOSIT", withdraw: "WITHDRAW", disburse: "LOAN DISBURSE",
    repay_princ: "LOAN REPAYMENT", repay_int: "LOAN INTEREST",
    income: "INCOME", expense: "EXPENSE", agent_handover: "AGENT HANDOVER",
  };

  async function saveImage() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#fff" });
    const link = document.createElement("a");
    link.download = `receipt-${tx.receiptNo || tx._id}.png`;
    link.href = canvas.toDataURL("image/png"); link.click();
  }

  async function shareWA() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#fff" });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `receipt-${tx.receiptNo}.png`, { type: "image/png" });
      const text = `${org.orgName || "FinSphere"} Receipt\n${typeLabels[tx.type]} - ${fmtCur(tx.amt, org.currency)}\nRef: ${tx.receiptNo}`;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], text, title: "Receipt" }); return; } catch {}
      }
      // Fallback: open WhatsApp web/app with the text
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }, "image/png");
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div ref={ref} className="p-5 font-mono text-[13px] leading-snug bg-white">
          <div className="text-center border-b-2 border-dashed pb-3 mb-3">
            <div className="text-lg font-bold tracking-wide">{org.orgName || "FinSphere"}</div>
            {org.orgAddress && <div className="text-xs">{org.orgAddress}</div>}
            {org.orgPhone && <div className="text-xs">Ph: {org.orgPhone}</div>}
          </div>
          <div className="flex justify-between"><span>Date</span><span>{fmtDateTime(tx.date)}</span></div>
          <div className="flex justify-between"><span>Receipt</span><span>{tx.receiptNo}</span></div>
          <div className="flex justify-between"><span>Type</span><span className="font-bold">{typeLabels[tx.type] || tx.type}</span></div>
          <div className="border-t border-dashed my-2"/>
          {cust && (<><div className="flex justify-between"><span>Customer</span><span>{cust.name}</span></div>
            {cust.mobile && <div className="flex justify-between"><span>Mobile</span><span>{cust.mobile}</span></div>}</>)}
          {tx.account && (<>
            <div className="flex justify-between"><span>Account</span><span>{tx.account.name}</span></div>
            <div className="flex justify-between"><span>A/c No</span><span>{tx.account.accNo}</span></div>
            <div className="flex justify-between"><span>Balance</span><span>{fmtCur(tx.account.balance, org.currency)}</span></div>
          </>)}
          <div className="border-t border-dashed my-2"/>
          <div className="flex justify-between text-base font-bold"><span>AMOUNT</span><span>{fmtCur(tx.amt, org.currency)}</span></div>
          <div className="flex justify-between text-xs"><span>Mode</span><span>{(tx.mode||"").toUpperCase()}</span></div>
          {tx.remarks && <div className="text-xs mt-1">Note: {tx.remarks}</div>}
          <div className="border-t-2 border-dashed mt-3 pt-2 text-center text-xs">
            {org.receiptFooter || "Thank you!"}
          </div>
        </div>
        <div className="flex gap-2 p-3 border-t">
          <button onClick={() => window.print()} className="btn-outline flex-1"><Printer size={14}/> Print</button>
          <button onClick={saveImage} className="btn-info flex-1"><ImageIcon size={14}/> Image</button>
          <button onClick={shareWA} className="btn-blue flex-1" style={{background:"#25D366"}}><MessageCircle size={14}/> WA</button>
          <button onClick={onClose} className="btn-outline">Close</button>
        </div>
      </div>
    </div>
  );
}
