"use client";

import { useMemo, useState } from "react";
import { Pause, Play, ReceiptText, Plane } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/features";
import type { Features } from "@/lib/types";

/** Quiet recurring charges with yearly lens + a trip fund you can feel. */
export function LeakDetector({ features }: { features: Features }) {
  const [paused, setPaused] = useState<string[]>([]);
  const travelTotal =
    features.categoryTotals.find((c) => c.category === "Travel")?.total ?? 7398;
  const [target, setTarget] = useState(Math.max(1000, Math.round(travelTotal)));
  const [months, setMonths] = useState(6);

  const monthly = useMemo(
    () => features.subscriptions.reduce((s, x) => s + x.amount, 0),
    [features.subscriptions]
  );
  const pausedMonthly = features.subscriptions
    .filter((s) => paused.includes(s.description))
    .reduce((s, x) => s + x.amount, 0);
  const perMonth = months > 0 ? Math.ceil(target / months) : 0;
  const progress = monthly > 0 ? Math.round((pausedMonthly / monthly) * 100) : 0;

  const toggle = (desc: string) =>
    setPaused((prev) =>
      prev.includes(desc) ? prev.filter((d) => d !== desc) : [...prev, desc]
    );

  if (features.subscriptions.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ReceiptText className="h-4 w-4" /> Small leaks, big year
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Monthly feels tiny. Yearly tells the truth.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div className="rounded-xl border bg-muted/50 p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold">{formatINR(monthly)}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
            <span className="text-xl font-bold">{formatINR(monthly * 12)}<span className="text-sm font-normal text-muted-foreground">/yr</span></span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {paused.length === 0
              ? "Select a charge below to preview pausing it."
              : `Pausing ${paused.length} keeps ${formatINR(pausedMonthly)}/mo = ${formatINR(pausedMonthly * 12)}/yr with you.`}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          {features.subscriptions.map((s) => {
            const isPaused = paused.includes(s.description);
            return (
              <button
                key={s.description}
                onClick={() => toggle(s.description)}
                aria-pressed={isPaused}
                className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-left transition active:scale-[0.99] ${
                  isPaused
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/60"
                }`}
              >
                <span>
                  <span className={`block text-sm font-medium ${isPaused ? "line-through opacity-70" : ""}`}>
                    {s.description}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatINR(s.amount)}/mo · <strong className="text-foreground">{formatINR(s.amount * 12)}/yr</strong>
                  </span>
                </span>
                <span
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                    isPaused
                      ? "bg-primary text-primary-foreground"
                      : "border hover:bg-muted"
                  }`}
                >
                  {isPaused ? <><Play className="h-3 w-3" /> Keep</> : <><Pause className="h-3 w-3" /> Pause</>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setPaused(features.subscriptions.map((s) => s.description))}
            className="rounded-full border px-3 py-1 text-xs transition hover:bg-muted active:scale-95"
          >
            Pause all
          </button>
          <button
            onClick={() => setPaused([])}
            className="rounded-full border px-3 py-1 text-xs transition hover:bg-muted active:scale-95"
          >
            Keep all
          </button>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border p-3">
          <span className="flex items-center gap-2 font-medium">
            <Plane className="h-4 w-4 text-muted-foreground" /> Next trip, pre-funded
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[travelTotal, 10000, 15000, 20000].map((v) => {
              const r = Math.round(v);
              return (
                <button
                  key={r}
                  onClick={() => setTarget(r)}
                  className={`rounded-full px-3 py-1 text-xs transition active:scale-95 ${
                    target === r ? "bg-foreground text-background" : "border hover:bg-muted"
                  }`}
                >
                  {formatINR(r)}
                </button>
              );
            })}
          </div>
          <label className="flex flex-col gap-1 text-xs">
            Or your own amount
            <input
              type="number" min={1000} step={500} value={target}
              onChange={(e) => setTarget(Math.max(0, Number(e.target.value) || 0))}
              className="rounded-md border bg-background px-2 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Spread over <strong>{months} month{months === 1 ? "" : "s"}</strong>
            <input
              type="range" min={1} max={12} step={1} value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </label>
          <div className="flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: Math.min(months, 12) }).map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full bg-primary/70" />
            ))}
          </div>
          <p className="rounded-lg border bg-muted/50 p-2.5 text-xs">
            Stash <strong>{formatINR(perMonth)}/month × {months}</strong> labelled ‘next trip’.
            15 minutes in your banking app, then forget it.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
