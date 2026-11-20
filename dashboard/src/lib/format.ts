const nf0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const nf2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const compactFmt = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export type ValueKind =
  | "count"
  | "usd"
  | "pct1"
  | "pct2"
  | "pts1"
  | "money0"
  | "pop";

export function compact(n: number): string {
  return compactFmt.format(n);
}

export function usd(n: number): string {
  const sign = n < 0 ? "−" : "";
  return `${sign}$${compactFmt.format(Math.abs(n))}`;
}

export function usdFull(n: number): string {
  const sign = n < 0 ? "−" : "";
  return `${sign}$${nf0.format(Math.abs(n))}`;
}

export function formatValue(kind: ValueKind, v: number): string {
  switch (kind) {
    case "count":
      return nf0.format(v);
    case "usd":
      return usd(v);
    case "pct1":
      return `${nf1.format(v)}%`;
    case "pct2":
      return `${nf2.format(v)}%`;
    case "pts1":
      return nf1.format(v);
    case "money0":
      return usdFull(v);
    case "pop":
      return compactFmt.format(v);
  }
}

export function axisValue(kind: ValueKind, v: number): string {
  switch (kind) {
    case "count":
    case "pop":
      return compactFmt.format(v);
    case "usd":
      return usd(v);
    case "pct1":
    case "pct2":
      return `${nf1.format(v)}%`;
    case "pts1":
      return nf0.format(v);
    case "money0":
      return usd(v);
  }
}

export function signedPct(n: number, digits = 1): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(digits)}%`;
}

export function signed(n: number, digits = 2): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(digits)}`;
}

/** Coefficients that span many orders of magnitude. */
export function sci(n: number): string {
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a >= 10000 || a < 0.01) {
    return n.toExponential(2).replace("e-", "e−").replace("e+", "e+");
  }
  return nf2.format(n);
}

export function pVal(p: number): string {
  if (p < 0.001) return "< 0.001";
  return p.toFixed(3);
}

export function fmtInt(n: number): string {
  return nf0.format(n);
}

export function fmt1(n: number): string {
  return nf1.format(n);
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
