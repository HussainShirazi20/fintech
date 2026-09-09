"use client";

import { useState } from "react";
import { Check, Copy, Download, Share2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildShareText } from "@/lib/share";
import { alignmentScore, formatINR } from "@/lib/features";
import type { Features, Insight, UserContext } from "@/lib/types";

export function ShareCard({
  features,
  context,
  insights,
}: {
  features: Features;
  context: UserContext;
  insights: Insight[];
}) {
  const [copied, setCopied] = useState(false);
  const [showText, setShowText] = useState(false);
  const text = buildShareText(features, context, insights);
  const align = alignmentScore(features, context.priorities);
  const cashLeft = features.income - features.outflow - (features.transferTotal ?? 0);
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paisalens-${features.periodStart}-to-${features.periodEnd}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const nativeShare = async () => {
    try {
      await (
        navigator as Navigator & { share: (d: { title: string; text: string }) => Promise<void> }
      ).share({ title: "PaisaLens — my month, reflected", text });
    } catch {
      /* dismissed — non-fatal */
    }
  };

  const top = features.categoryTotals.slice(0, 3);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Take it with you</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          A postcard of your month — send it to yourself, or a friend who gets it.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Postcard preview */}
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            PaisaLens · {features.periodStart} → {features.periodEnd}
          </p>
          <p className="mt-1 text-lg font-bold leading-snug">
            {formatINR(features.income)} in · {formatINR(features.outflow)} spent · {formatINR(cashLeft)} left
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">
              {align.score}% aligned
            </Badge>
            {top.map((c) => (
              <span key={c.category} className="rounded-full border bg-muted/60 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                {c.category} {formatINR(c.total)}
              </span>
            ))}
          </div>
          {insights[0] && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {insights[0].observation}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={copy}>
            {copied ? <Check /> : <Copy />} {copied ? "Copied!" : "Copy note"}
          </Button>
          <Button size="sm" variant="outline" onClick={download}>
            <Download /> Save .txt
          </Button>
          {canNativeShare && (
            <Button size="sm" variant="outline" onClick={nativeShare}>
              <Share2 /> Send…
            </Button>
          )}
          <button
            onClick={() => setShowText((v) => !v)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {showText ? "Hide full text" : "Preview full text"}
            <ChevronDown className={`h-3.5 w-3.5 transition ${showText ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showText && (
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-xs leading-relaxed">
            {text}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
