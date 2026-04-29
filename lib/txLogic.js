// Mirrors getTxMod from the source FinSphere app.
// Returns multiplier (-1 / +1) applied to amount when updating an account balance.
export function getTxMod(group, type) {
  if (!group) return 1;
  const isAsset = group.type === "Asset";
  const isLiability = group.type === "Liability";
  const t = String(type).toLowerCase();
  if (isAsset) {
    if (["disburse", "withdraw", "expense"].includes(t)) return 1;   // debit increases asset
    if (["deposit", "repay_princ", "income"].includes(t)) return -1; // credit decreases asset (e.g. loan paid down)
  }
  if (isLiability) {
    if (["deposit", "repay_princ"].includes(t)) return 1;
    if (["withdraw", "disburse"].includes(t)) return -1;
  }
  return 1;
}

// Secondary account (cash/bank) impact: positive types add cash, negative remove.
export function secondaryDelta(type, amt) {
  const t = String(type).toLowerCase();
  if (["deposit", "repay_princ", "repay_int", "income", "agent_handover"].includes(t)) return +amt;
  if (["withdraw", "disburse", "expense"].includes(t)) return -amt;
  return 0;
}

export const TX_TYPES = [
  { value: "deposit", label: "Deposit" },
  { value: "withdraw", label: "Withdraw" },
  { value: "disburse", label: "Loan Disburse" },
  { value: "repay_princ", label: "Loan Repayment (Principal)" },
  { value: "repay_int", label: "Loan Interest" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "agent_handover", label: "Agent Handover" },
];
