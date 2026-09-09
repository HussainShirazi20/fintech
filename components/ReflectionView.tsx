"use client";

import { RotateCcw, Wallet, TrendingUp, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CategoryBar, RhythmChart } from "./Charts";
import { AlignmentMeter } from "./AlignmentMeter";
import { InsightCard } from "./InsightCard";
import { ShareCard } from "./ShareCard";
import { WhatIfSimulator } from "./WhatIfSimulator";
import { LeakDetector } from "./LeakDetector";
import { TxnTable } from "./TxnTable";
import { PrivacyNote } from "./PrivacyNote";
import { alignmentScore, formatINR } from "@/lib/features";
import type { Features, Insight, Transaction, UserContext } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  features: Features;
  insights: Insight[];
  context: UserContext;
  model: string;
  onRestart: () => void;
  onTryOtherContext: () => void;
}

export function ReflectionView({
  transactions,
  features,
  insights,
  context,
  model,
  onRestart,
  onTryOtherContext,
}: Props) {
  const align = alignmentScore(features, context.priorities);
  const transferTotal = features.transferTotal ?? 0;
  const totalSpent = features.outflow + transferTotal;
  const cashLeft = features.income - totalSpent;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your month, reflected</h2>
          <p className="text-sm text-muted-foreground">
            {features.periodStart} → {features.periodEnd} · {features.txnCount} transactions ·{" "}
            {context.lifeStage} · {context.incomePattern} income
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onTryOtherContext}>
            <Repeat /> Try another context
          </Button>
          <Button variant="ghost" size="sm" onClick={onRestart}>
            <RotateCcw /> Start over
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Wallet className="h-4 w-4" /> Inflow
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {formatINR(features.income)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Wallet className="h-4 w-4" /> Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalSpent)}</div>
            {transferTotal > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                incl. {formatINR(transferTotal)} transfers (SIP + card payment)
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Cash left
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(features.savingsRate * 100).toFixed(0)}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatINR(cashLeft)} left of {formatINR(features.income)}
            </p>
          </CardContent>
        </Card>
      </div>
      {transferTotal > 0 && (
        <p className="-mt-2 text-xs text-muted-foreground">
          {formatINR(features.income)} in = {formatINR(features.outflow)} spend +{" "}
          {formatINR(transferTotal)} transfers + {formatINR(cashLeft)} left — adds up, nothing missing.
        </p>
      )}

      <AlignmentMeter
        score={align.score}
        alignedSpend={align.alignedSpend}
        totalSpend={align.totalSpend}
        priorities={context.priorities}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryBar features={features} />
        <RhythmChart features={features} />
      </div>

      {features.subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recurring charges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {features.subscriptions.map((s) => (
              <Badge key={s.description} variant="outline" className="px-3 py-1.5">
                {s.description} · ~{formatINR(s.amount)} × {s.count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="mb-3 text-lg font-semibold">Three things worth noticing</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {insights.map((ins, i) => (
            <InsightCard key={ins.id} insight={ins} index={i} transactions={transactions} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Make next month lighter</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Play with the numbers — nothing here touches your real data.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <WhatIfSimulator features={features} transactions={transactions} />
          <LeakDetector features={features} />
        </div>
      </div>

      <ShareCard features={features} context={context} insights={insights} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All transactions ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TxnTable transactions={transactions} compact />
        </CardContent>
      </Card>

      <PrivacyNote compact />
      <Separator />
      <p className="text-center text-xs text-muted-foreground">
        Generated with {model} · numbers computed from your data, never invented.
      </p>
    </div>
  );
}
