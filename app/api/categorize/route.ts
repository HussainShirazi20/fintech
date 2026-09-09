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
 * POST /api/categorize — keyword rules first, LLM only for unknowns.
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

  const results = new Map<
    string,
    { category: string; confidence: number; source: "rule" | "llm" | "default" }
  >();
  const unknown: { id: string; description: string; type: "credit" | "debit"; amount: number }[] = [];

  for (const t of parsed.data.transactions) {
    const hit = categoriseDescription(t.description, t.type, t.amount);
    if (hit) {
      results.set(t.id, { category: hit.category, confidence: hit.confidence, source: "rule" });
    } else {
      unknown.push({
        id: t.id,
        description: sanitiseDescription(t.description),
        type: t.type,
        amount: t.amount,
      });
    }
  }

  if (unknown.length > 0 && isLlmConfigured()) {
    try {
      const prompt = `Categorise each Indian bank/UPI transaction into exactly one of: ${ALL_CATEGORIES.join(", ")}.
Use "Transfer" for loans, EMIs, credit-card payments, investments, self-transfers. Use "Income" for salary, payouts, refunds.
Transactions: ${JSON.stringify(unknown)}
Return ONLY JSON: {"categories":[{"id":"...","category":"...","confidence":0.0-1.0}]}`;
      const { text } = await chatJson(prompt);
      const llmParsed = LlmCatSchema.safeParse(extractJson(text));
      if (llmParsed.success) {
        for (const c of llmParsed.data.categories) {
          if (unknown.some((u) => u.id === c.id)) {
            results.set(c.id, { category: c.category, confidence: c.confidence, source: "llm" });
          }
        }
      }
    } catch {
      // fall through to default below — categorisation must never hard-fail
    }
  }

  for (const t of parsed.data.transactions) {
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
    llmUsed: isLlmConfigured() && unknown.length > 0,
  });
}
