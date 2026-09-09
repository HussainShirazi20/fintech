"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, RotateCcw, Copy, Check, UtensilsCrossed, Tv, ShoppingBag, SlidersHorizontal, PiggyBank, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/features";
import type { Features, Transaction } from "@/lib/types";

/** Interactive "lighter month" playground — every rupee traces to real totals. */
export function WhatIfSimulator({
  features,
  transactions,
}: {
  features: Features;
  transactions: Transaction[];
}) {
  const foodTxns = useMemo(
    () => transactions.filter((t) => t.type === "debit" && t.category === "Food & Dining"),
    [transactions]
  );
  const avgDelivery =
    foodTxns.length > 0
      ? Math.round(foodTxns.reduce((s, t) => s + t.amount, 0) / foodTxns.length)
      : 0;
  const shoppingTotal =
    features.categoryTotals.find((c) => c.category === "Shopping")?.total ?? 0;
  const maxDeliveries = Math.max(foodTxns.length, 4);

  const [fewerDeliveries, setFewerDeliveries] = useState(Math.min(2, foodTxns.length));
  const [pausedSubs, setPausedSubs] = useState<string[]>([]);
  const [shoppingCut, setShoppingCut] = useState(5);
  const [planCopied, setPlanCopied] = useState(false);

  const toggleSub = (desc: string) =>
    setPausedSubs((prev) =>
      prev.includes(desc) ? prev.filter((d) => d !== desc) : [...prev, desc]
    );

  const deliverySaving = fewerDeliveries * avgDelivery;
  const subSaving = features.subscriptions
    .filter((s) => pausedSubs.includes(s.description))
    .reduce((s, x) => s + x.amount, 0);
  const shoppingSaving = Math.round((shoppingTotal * shoppingCut) / 100);
  const totalSaving = deliverySaving + subSaving + shoppingSaving;

  const transferTotal = features.transferTotal ?? 0;
  const newSpend = Math.max(0, features.outflow - totalSaving);
  const newCash = features.income - newSpend - transferTotal;
  const newRate = features.income > 0 ? (newCash / features.income) * 100 : 0;
  const spendPct = features.outflow > 0 ? Math.max(4, Math.round((newSpend / features.outflow) * 100)) : 0;

  const applyPreset = (kind: "reset" | "easy" | "big") => {
    if (kind === "reset") {
      setFewerDeliveries(0);
      setPausedSubs([]);
      setShoppingCut(0);
    } else if (kind === "easy") {
      setFewerDeliveries(Math.min(2, foodTxns.length));
      const cheapest = [...features.subscriptions].sort((a, b) => a.amount - b.amount)[0];
      setPausedSubs(cheapest ? [cheapest.description] : []);
      setShoppingCut(10);
    } else {
      setFewerDeliveries(Math.min(4, maxDeliveries));
      setPausedSubs(features.subscriptions.map((s) => s.description));
      setShoppingCut(25);
    }
  };

  const copyPlan = async () => {
    const lines = [
      `My lighter-month plan (${formatINR(totalSaving)}/mo freed):`,
      `- ${fewerDeliveries} fewer deliver${fewerDeliveries === 1 ? "y" : "ies"} → ${formatINR(deliverySaving)}`,
      `- Paused: ${pausedSubs.length > 0 ? pausedSubs.join(", ") : "none"} → ${formatINR(subSaving)}`,
      `- Shopping -${shoppingCut}% → ${formatINR(shoppingSaving)}`,
      `Spend ${formatINR(features.outflow)} → ${formatINR(newSpend)} · Cash left ${formatINR(newCash)} (${newRate.toFixed(0)}%)`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(lines);
    } catch {
      /* clipboard blocked — non-fatal */
    }
    setPlanCopied(true);
    setTimeout(() => setPlanCopied(false), 2000);
  };

  const stepBtn =
    "flex h-7 w-7 items-center justify-center rounded-full border transition hover:bg-muted active:scale-95";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal className="h-4 w-4" /> What would you keep?
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Nudge things around — the month reshapes itself live.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => applyPreset("reset")}>
            <RotateCcw /> Reset
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            onClick={() => applyPreset("easy")}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition hover:bg-muted active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" /> Easy win
          </button>
          <button
            onClick={() => applyPreset("big")}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition hover:bg-muted active:scale-95"
          >
            <TrendingUp className="h-3.5 w-3.5" /> Big shift
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {/* Deliveries */}
        <div className="rounded-xl border p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-medium">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" /> Fewer deliveries
            </span>
            <div className="flex items-center gap-2">
              <button
                className={stepBtn}
                onClick={() => setFewerDeliveries((v) => Math.max(0, v - 1))}
                aria-label="fewer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-base font-bold tabular-nums">{fewerDeliveries}</span>
              <button
                className={stepBtn}
                onClick={() => setFewerDeliveries((v) => Math.min(maxDeliveries, v + 1))}
                aria-label="more"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <input
            type="range" min={0} max={maxDeliveries} step={1}
            value={fewerDeliveries}
            onChange={(e) => setFewerDeliveries(Number(e.target.value))}
            className="mt-2 w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            ~{formatINR(avgDelivery)} each · saves <strong className="text-foreground">{formatINR(deliverySaving)}</strong>
          </p>
        </div>

        {/* Subscriptions */}
        {features.subscriptions.length > 0 && (
          <div className="rounded-xl border p-3">
            <p className="flex items-center gap-2 font-medium">
              <Tv className="h-4 w-4 text-muted-foreground" /> Put on pause
            </p>
            <p className="text-xs text-muted-foreground">Tap to pause — tap again to keep.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {features.subscriptions.map((s) => {
                const on = pausedSubs.includes(s.description);
                return (
                  <button
                    key={s.description}
                    onClick={() => toggleSub(s.description)}
                    aria-pressed={on}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                      on
                        ? "border-primary bg-primary/10 text-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {s.description} · {formatINR(s.amount)}
                  </button>
                );
              })}
            </div>
            {subSaving > 0 && (
              <p className="mt-1.5 text-xs">Paused saves <strong>{formatINR(subSaving)}/mo</strong></p>
            )}
          </div>
        )}

        {/* Shopping */}
        <div className="rounded-xl border p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" /> Shopping trim
            </span>
            <span className="text-sm font-bold tabular-nums">{shoppingCut}%</span>
          </div>
          <input
            type="range" min={0} max={50} step={5}
            value={shoppingCut}
            onChange={(e) => setShoppingCut(Number(e.target.value))}
            className="mt-2 w-full accent-primary"
          />
          <div className="mt-1 flex gap-1.5">
            {[0, 10, 25, 50].map((p) => (
              <button
                key={p}
                onClick={() => setShoppingCut(p)}
                className={`rounded-full px-2.5 py-0.5 text-xs transition active:scale-95 ${
                  shoppingCut === p ? "bg-foreground text-background" : "border hover:bg-muted"
                }`}
              >
                {p}%
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">
              of {formatINR(shoppingTotal)} → saves {formatINR(shoppingSaving)}
            </span>
          </div>
        </div>

        {/* Live result */}
        <div className="rounded-xl border bg-muted/50 p-3">
          <div className="flex items-baseline justify-between">
            <span className="flex items-center gap-2 text-2xl font-bold">
              <PiggyBank className="h-5 w-5 text-muted-foreground" />
              +{formatINR(totalSaving)}
            </span>
            <span className="text-xs text-muted-foreground">freed / month</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${spendPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Spend {formatINR(features.outflow)} → <strong className="text-foreground">{formatINR(newSpend)}</strong>
            {" · "}Cash left <strong className="text-foreground">{formatINR(newCash)} ({newRate.toFixed(0)}%)</strong>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={copyPlan}>
              {planCopied ? <Check /> : <Copy />} {planCopied ? "Plan copied!" : "Copy this plan"}
            </Button>
            {totalSaving > 0 && (
              <span className="text-xs text-muted-foreground">Move it to SIP the same day you skip.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
