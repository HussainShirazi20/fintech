import { NextResponse } from "next/server";
import { z } from "zod";
import { ALL_CATEGORIES, categoriseDescription, sanitiseDescription } from "@/lib/categories";
import { chatJson, extractJson, isLlmConfigured } from "@/lib/llm";

const ItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1).max(200),
  type: z.enum(["credit", "debit"]),
  amount: z.number().nonnegative(),
});

const BodySchema = z.object({
  transactions: z.array(ItemSchema).min(1).max(200),
});

const LlmCatSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      category: z.enum(ALL_CATEGORIES as [string, ...string[]]),
      confidence: z.number().min(0).max(1),
    })
  ),
});

/**
 * POST /api/categorize — AI decides first (all transactions go to the LLM
 * when configured); keyword rules are the fallback for anything the LLM
 * misses plus the offline path when no key is set.
 * Descriptions are sanitised (account numbers stripped) before any LLM call.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid transactions payload" }, { status: 400 });
  }

  const items = parsed.data.transactions;
  const results = new Map<
    string,
    { category: string; confidence: number; source: "rule" | "llm" | "default" }
  >();
  let llmUsed = false;

  const applyRules = (
    ids: { id: string; description: string; type: "credit" | "debit"; amount: number }[]
  ) => {
    for (const t of ids) {
      const hit = categoriseDescription(t.description, t.type, t.amount);
      // Rules see the original description (local only — never sent anywhere).
      if (hit) {
        results.set(t.id, { category: hit.category, confidence: hit.confidence, source: "rule" });
      }
    }
  };

  if (isLlmConfigured()) {
    // AI-first: every transaction goes to the model in ONE call.
    const sanitised = items.map((t) => ({
      id: t.id,
      description: sanitiseDescription(t.description),
      type: t.type,
      amount: t.amount,
    }));
    try {
      const prompt = `Categorise each Indian bank/UPI transaction into exactly one of: ${ALL_CATEGORIES.join(", ")}.
Use "Transfer" for loans, EMIs, credit-card payments, investments, self-transfers. Use "Income" for salary, payouts, refunds. Base it on the merchant/meaning of the description.
Transactions: ${JSON.stringify(sanitised)}
Return ONLY JSON: {"categories":[{"id":"...","category":"...","confidence":0.0-1.0}]} — one entry per transaction id, no extras.`;
      const { text } = await chatJson(prompt, 4000);
      const llmParsed = LlmCatSchema.safeParse(extractJson(text));
      if (llmParsed.success) {
        const knownIds = new Set(items.map((t) => t.id));
        for (const c of llmParsed.data.categories) {
          if (knownIds.has(c.id) && !results.has(c.id)) {
            results.set(c.id, { category: c.category, confidence: c.confidence, source: "llm" });
          }
        }
        llmUsed = true;
      }
    } catch {
      // fall through to rules below — categorisation must never hard-fail
    }
    // Rules cover whatever the AI missed or rejected.
    const missing = items.filter((t) => !results.has(t.id));
    if (missing.length > 0) applyRules(missing);
  } else {
    applyRules(items);
  }

  for (const t of items) {
    if (!results.has(t.id)) {
      results.set(t.id, {
        category: t.type === "credit" ? "Income" : "Other",
        confidence: 0.4,
        source: "default",
      });
    }
  }

  return NextResponse.json({
    categories: [...results.entries()].map(([id, v]) => ({ id, ...v })),
    llmUsed,
  });
}
