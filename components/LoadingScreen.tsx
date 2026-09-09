"use client";

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STEPS = ["Parsing transactions", "Categorising spend", "Reflecting on patterns"];

export function LoadingScreen({ step }: { step: number }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Reading your month…</h2>
        <p className="text-sm text-muted-foreground">
          {STEPS[Math.min(step, STEPS.length - 1)]} — this takes a few seconds.
        </p>
      </div>
      <Card className="w-full">
        <CardContent className="flex flex-col gap-3 pt-6">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    </div>
  );
}
