export const fmtCur = (n, sym = "₹") =>
  `${sym}${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtDateTime = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);
