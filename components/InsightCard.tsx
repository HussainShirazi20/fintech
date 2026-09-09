"use client";

import { Eye, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TxnTable } from "./TxnTable";
import { formatINR } from "@/lib/features";
import type { Insight, Transaction } from "@/lib/types";

export function InsightCard({
  insight,
  index,
  transactions,
}: {
  insight: Insight;
  index: number;
  transactions: Transaction[];
}) {
  const backers = insight.txnIds
    .map((id) => transactions.find((t) => t.id === id))
    .filter((t): t is Transaction => Boolean(t));

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Insight {index + 1}</Badge>
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardTitle className="text-base leading-snug">{insight.observation}</CardTitle>
        <CardDescription>{insight.whyItMatters}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="rounded-lg bg-muted/60 p-3 text-sm">
          <span className="font-medium">This week: </span>
          {insight.action}
        </div>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye /> See backing transactions ({backers.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Why we say this</DialogTitle>
              <DialogDescription>
                Every number in this insight traces to these transactions — totalling{" "}
                {formatINR(backers.reduce((s, t) => s + t.amount, 0))}.
              </DialogDescription>
            </DialogHeader>
            <TxnTable transactions={backers} />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
