import type { Features, Insight, Transaction, UserContext } from "./types";
import { formatINR } from "./features";

/**
 * Deterministic rule-based fallback. Used when the LLM is unreachable,
 * returns invalid JSON, cites unknown txns, or uses shaming language —
 * per failed slot (or wholesale). Grounded in real numbers only.
 */

function backersFor(category: string, txns: Transaction[], n = 3): Transaction[] {
  return txns
    .filter((t) => t.type === "debit" && t.category === category)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, n);
}

function toInsight(
  id: string,
  txns: Transaction[],
  observation: string,
  whyItMatters: string,
  action: string
): Insight | null {
  if (txns.length === 0) return null;
  return {
    id,
    observation,
    whyItMatters,
    action,
    txnIds: txns.map((t) => t.id),
    amounts: txns.map((t) => t.amount),
  };
}

export function fallbackInsights(
  features: Features,
  txns: Transaction[],
  ctx: UserContext
): Insight[] {
  const out: Insight[] = [];
  const prio = ctx.priorities.join(" ").toLowerCase();

  // 1. Top category concentration
  const top = features.categoryTotals[0];
  if (top) {
    const ins = toInsight(
      "fallback-1",
      backersFor(top.category, txns),
      `Your biggest outflow is ${top.category}: ${formatINR(top.total)} across ${top.count} transactions — about ${features.outflow > 0 ? Math.round((top.total / features.outflow) * 100) : 0}% of everything you spent.`,
      ctx.lifeStage === "student"
        ? "As a student this is worth noticing early: small recurring choices here shape the habits you carry into your first salary."
        : ctx.lifeStage === "family"
          ? "With a family to plan for, knowing your single biggest bucket makes it easier to protect it together."
          : "Knowing your biggest bucket is the fastest way to check whether your money is flowing where you said it matters.",
      "Open your top 3 transactions in this category and tag one as 'worth it' or 'meh' — 10 minutes, no spreadsheet needed."
    );
    if (ins) out.push(ins);
  }

  // 2. Weekend vs weekday rhythm
  const weekendPct = features.weekdaySpend + features.weekendSpend > 0
    ? Math.round((features.weekendSpend / (features.weekdaySpend + features.weekendSpend)) * 100)
    : 0;
  if (features.weekendSpend > features.weekdaySpend * 0.6) {
    const weekendTxns = txns
      .filter((t) => {
        const d = new Date(t.date + "T00:00:00").getDay();
        return t.type === "debit" && (d === 0 || d === 6);
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
    const ins = toInsight(
      "fallback-2",
      weekendTxns,
      `Weekends carry ${formatINR(features.weekendSpend)} of your spend (${weekendPct}%) vs ${formatINR(features.weekdaySpend)} on weekdays — your money has a weekend rhythm.`,
      /entertain|fun|leisure|travel/.test(prio)
        ? "Since fun and leisure are among your priorities, weekend spending is partly on-purpose — the question is just which weekends felt worth it."
        : "Weekend spikes are normal, but because they bunch together they are the easiest pattern to preview before it happens.",
      "This Friday, set one number for the weekend (say ₹1,500) in your notes app and check it once on Sunday night."
    );
    if (ins) out.push(ins);
  }

  // 3. Subscriptions / recurring
  if (features.subscriptions.length > 0) {
    const biggest = features.subscriptions[0];
    const monthly = features.subscriptions.reduce((s, x) => s + x.amount, 0);
    const related = txns
      .filter((t) => t.description === biggest.description)
      .slice(0, 3);
    const ins = toInsight(
      "fallback-3",
      related,
      `You have ${features.subscriptions.length} recurring charges totalling roughly ${formatINR(monthly)}/month — largest is ${biggest.description} (~${formatINR(biggest.amount)}).`,
      ctx.incomePattern === "irregular"
        ? "With irregular income, fixed monthly charges deserve extra attention because they don't flex when earnings dip."
        : "Recurring charges are quiet because you approve them once and pay forever — a yearly glance catches the ones you've outgrown.",
      "List your subscriptions on paper and circle one to pause or downgrade this week — most take under 5 minutes to cancel."
    );
    if (ins) out.push(ins);
  }

  // 4. Savings rate guard (fills any gap)
  if (out.length < 3) {
    const pct = (features.savingsRate * 100).toFixed(0);
    const big = [...txns].filter((t) => t.type === "debit").sort((a, b) => b.amount - a.amount).slice(0, 3);
    const ins = toInsight(
      "fallback-4",
      big,
      `You kept about ${pct}% of what came in (${formatINR(features.income)} in, ${formatINR(features.outflow)} out).`,
      ctx.lifeStage === "family"
        ? "For a household, even a thin positive margin is a buffer against surprise expenses — consistency beats size."
        : "A visible margin, however small, is what turns income into options later.",
      "Move a fixed ₹500 to a separate account the day after your next inflow — automate the decision once."
    );
    if (ins) out.push(ins);
  }

  // 5. Largest single expense (guarantees a third distinct slot)
  if (out.length < 3) {
    const big = [...txns].filter((t) => t.type === "debit").sort((a, b) => b.amount - a.amount).slice(0, 2);
    if (big.length > 0) {
      const share = features.outflow > 0 ? Math.round((big[0].amount / features.outflow) * 100) : 0;
      const ins = toInsight(
        "fallback-5",
        big,
        `Your single biggest spend is ${big[0].description} at ${formatINR(big[0].amount)} — about ${share}% of the month's outflow in one go.`,
        ctx.incomePattern === "irregular"
          ? "Big one-off spends hit harder on irregular income, so spotting them afterwards is how you plan for the next one."
          : "Single big spends are rarely the problem — but naming them keeps them conscious instead of invisible.",
        "Put a 24-hour pause rule on any unplanned spend above this size next month."
      );
      if (ins) out.push(ins);
    }
  }

  return out.slice(0, 3);
}
