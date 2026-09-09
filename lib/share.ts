import type { Features, Insight, UserContext } from "./types";
import { formatINR, alignmentScore } from "./features";

/** Plain-text reflection summary — copy / share / download, no numbers invented. */
export function buildShareText(
  features: Features,
  context: UserContext,
  insights: Insight[]
): string {
  const align = alignmentScore(features, context.priorities);
  const transferTotal = features.transferTotal ?? 0;
  const totalSpent = features.outflow + transferTotal;
  const cashLeft = features.income - totalSpent;
  const top = features.categoryTotals.slice(0, 3).map((c) => `${c.category} ${formatINR(c.total)}`).join(" · ");
  const lines = [
    `PaisaLens — my month, reflected (${features.periodStart} → ${features.periodEnd})`,
    `${formatINR(features.income)} in · ${formatINR(totalSpent)} spent (incl. ${formatINR(transferTotal)} transfers) · ${formatINR(cashLeft)} left (${(features.savingsRate * 100).toFixed(0)}%)`,
    `Priorities (${context.priorities.join(", ") || "—"}): ${align.score}% aligned — ${formatINR(align.alignedSpend)} of ${formatINR(align.totalSpend)}`,
    `Top buckets: ${top}`,
    ...insights.slice(0, 3).map((ins, i) => `${i + 1}. ${ins.observation} → ${ins.action}`),
    `Private by design — numbers computed from my data, never invented.`,
  ];
  return lines.join("\n");
}
