import type { Features, Transaction } from "./types";

/** All numeric features are computed in code — never by the LLM. */
export function computeFeatures(txns: Transaction[]): Features {
  const debits = txns.filter((t) => t.type === "debit");
  const credits = txns.filter((t) => t.type === "credit");

  const income = credits.reduce((s, t) => s + t.amount, 0);
  const outflow = debits.reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? (income - outflow) / income : 0;

  const byCat = new Map<string, { total: number; count: number }>();
  for (const t of debits) {
    if (t.category === "Transfer") continue; // money movement, not spend
    const key = t.category ?? "Other";
    const cur = byCat.get(key) ?? { total: 0, count: 0 };
    cur.total += t.amount;
    cur.count += 1;
    byCat.set(key, cur);
  }
  const categoryTotals = [...byCat.entries()]
    .map(([category, v]) => ({ category: category as Features["categoryTotals"][number]["category"], ...v }))
    .sort((a, b) => b.total - a.total);

  let weekdaySpend = 0;
  let weekendSpend = 0;
  let firstHalfSpend = 0;
  let secondHalfSpend = 0;
  for (const t of debits) {
    const d = new Date(t.date + "T00:00:00");
    const day = d.getDay();
    if (day === 0 || day === 6) weekendSpend += t.amount;
    else weekdaySpend += t.amount;
    if (d.getDate() <= 15) firstHalfSpend += t.amount;
    else secondHalfSpend += t.amount;
  }

  // Recurring = same normalised merchant, similar amount, 2+ times
  const groups = new Map<string, Transaction[]>();
  for (const t of debits) {
    const key = t.description.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const arr = groups.get(key) ?? [];
    arr.push(t);
    groups.set(key, arr);
  }
  const subscriptions = [...groups.entries()]
    .filter(([, arr]) => arr.length >= 2)
    .map(([, arr]) => ({
      description: arr[0].description,
      amount: Math.round(arr.reduce((s, t) => s + t.amount, 0) / arr.length),
      count: arr.length,
    }))
    .sort((a, b) => b.amount * b.count - a.amount * a.count)
    .slice(0, 6);

  const topExpenses = [...debits]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((t) => ({ id: t.id, description: t.description, amount: t.amount, date: t.date }));

  const creditCount = credits.length;
  const incomeRegularity =
    creditCount === 0 ? "none" : creditCount === 1 ? "single" : "regular";

  const dates = txns.map((t) => t.date).sort();
  return {
    income: Math.round(income),
    outflow: Math.round(outflow),
    savingsRate: Math.round(savingsRate * 1000) / 1000,
    categoryTotals,
    weekdaySpend: Math.round(weekdaySpend),
    weekendSpend: Math.round(weekendSpend),
    firstHalfSpend: Math.round(firstHalfSpend),
    secondHalfSpend: Math.round(secondHalfSpend),
    subscriptions,
    topExpenses,
    incomeRegularity,
    txnCount: txns.length,
    periodStart: dates[0] ?? "",
    periodEnd: dates[dates.length - 1] ?? "",
  };
}

/** Priority-alignment: share of spend in categories tied to user priorities. */
const PRIORITY_MAP: { keywords: RegExp; categories: string[] }[] = [
  { keywords: /health|fitness|gym|medical/i, categories: ["Health"] },
  { keywords: /food|eat|dining|grocer/i, categories: ["Food & Dining", "Groceries"] },
  { keywords: /travel|trip|vacation/i, categories: ["Travel", "Transport"] },
  { keywords: /learn|educat|course|skill|upskill|study/i, categories: ["Education"] },
  { keywords: /sav|invest|emergency|future|retire/i, categories: ["Transfer"] },
  { keywords: /home|rent|family|housing/i, categories: ["Rent & Housing", "Bills & Utilities"] },
  { keywords: /entertain|fun|movie|leisure|hobby/i, categories: ["Entertainment", "Subscriptions"] },
  { keywords: /shop|cloth|lifestyle/i, categories: ["Shopping"] },
];

export function alignmentScore(
  features: Features,
  priorities: string[]
): { score: number; alignedSpend: number; totalSpend: number } {
  const aligned = new Set<string>();
  for (const p of priorities) {
    for (const m of PRIORITY_MAP) {
      if (m.keywords.test(p)) m.categories.forEach((c) => aligned.add(c));
    }
  }
  const totalSpend = features.categoryTotals.reduce((s, c) => s + c.total, 0);
  const alignedSpend = features.categoryTotals
    .filter((c) => aligned.has(c.category))
    .reduce((s, c) => s + c.total, 0);
  const score = totalSpend > 0 ? Math.round((alignedSpend / totalSpend) * 100) : 0;
  return { score, alignedSpend: Math.round(alignedSpend), totalSpend: Math.round(totalSpend) };
}

export function formatINR(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
