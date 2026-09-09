/**
 * Minimal OpenAI-compatible chat client. Swappable via env:
 *  - OPENAI_API_KEY  (required for live calls)
 *  - LLM_MODEL       (default: gpt-4o-mini)
 *  - LLM_BASE_URL    (default: https://api.openai.com/v1 — point at any
 *                     OpenAI-compatible endpoint, e.g. Groq / OpenRouter)
 */

export interface LlmResult {
  text: string;
  usedFallback: boolean;
  model: string;
}

export function llmConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.LLM_MODEL ?? "gpt-4o-mini",
    baseUrl: (process.env.LLM_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
  };
}

export function isLlmConfigured(): boolean {
  return llmConfig().apiKey.length > 0;
}

export async function chatJson(prompt: string, maxTokens = 8192): Promise<LlmResult> {
  const { apiKey, model, baseUrl } = llmConfig();
  if (!apiKey) {
    return { text: "", usedFallback: true, model: `${model} (not configured)` };
  }
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You return exactly one JSON object, no markdown, no commentary.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LLM HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const choice = data?.choices?.[0];
  const text: string = choice?.message?.content ?? "";
  if (!text) throw new Error("LLM returned empty content");
  if (choice?.finish_reason === "length") {
    throw new Error("LLM output truncated (token budget exhausted)");
  }
  return { text, usedFallback: false, model };
}

export function extractJson(text: string): unknown {
  // Tolerate ```json fences if the model adds them despite instructions.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  return JSON.parse(raw);
}

/** Demo-safety: deterministic sample insights, used for cached sample flow. */
export async function sampleInsights(): Promise<LlmResult> {
  const { default: data } = await import("./sample-insights.json");
  return { text: JSON.stringify(data), usedFallback: true, model: "cached-sample" };
}
