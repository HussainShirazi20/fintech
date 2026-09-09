import type { Features, Insight, Transaction, UserContext } from "./types";

export interface PipelineResult {
  transactions: Transaction[];
  features: Features;
  insights: Insight[];
  model: string;
}

/**
 * Runs the full reflection pipeline against the API routes:
 * 1. POST /api/categorize — rules first, LLM fallback server-side.
 *    User corrections (confidence === 1) are respected.
 * 2. POST /api/insights — features computed server-side + 1 LLM call.
 */
export async function runPipeline(
  txns: Transaction[],
  ctx: UserContext,
  sample: boolean,
  onStage?: (stage: number) => void
): Promise<PipelineResult> {
  onStage?.(0);
  const catRes = await fetch("/api/categorize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactions: txns.map((t) => ({
        id: t.id,
        description: t.description,
        type: t.type,
        amount: t.amount,
      })),
    }),
  });
  if (!catRes.ok) throw new Error("Categorisation failed");
  const catData = await catRes.json();
  const catMap = new Map<string, { category: Transaction["category"]; confidence: number }>(
    (
      catData.categories as {
        id: string;
        category: Transaction["category"];
        confidence: number;
      }[]
    ).map((c) => [c.id, { category: c.category, confidence: c.confidence }])
  );
  const categorised = txns.map((t) =>
    t.confidence === 1 && t.category
      ? t
      : {
          ...t,
          category:
            catMap.get(t.id)?.category ?? (t.type === "credit" ? "Income" : "Other"),
          confidence: catMap.get(t.id)?.confidence ?? 0.4,
        }
  );

  onStage?.(1);
  onStage?.(2);
  const insRes = await fetch("/api/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactions: categorised,
      context: ctx,
      useSampleCache: sample,
    }),
  });
  if (!insRes.ok) throw new Error("Insight generation failed");
  const insData = await insRes.json();
  return {
    transactions: categorised,
    features: insData.features as Features,
    insights: insData.insights as Insight[],
    model: insData.model as string,
  };
}
