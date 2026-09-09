"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TxnTable } from "./TxnTable";
import { PrivacyNote } from "./PrivacyNote";
import { useFlow } from "@/lib/store";
import { SAMPLE_TXNS } from "@/lib/sample-data";
import { formatINR } from "@/lib/features";

export function SamplePreview() {
  const router = useRouter();
  const { loadSample } = useFlow();
  const total = SAMPLE_TXNS.filter((t) => t.type === "debit").reduce(
    (s, t) => s + t.amount,
    0
  );

  function useSample() {
    loadSample();
    router.push("/context");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-8">
      <div>
        <Badge variant="secondary" className="mb-2">
          <Sparkles className="mr-1 h-3 w-3" /> Synthetic demo data
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight">A sample month</h2>
        <p className="text-sm text-muted-foreground">
          {SAMPLE_TXNS.length} transactions · {formatINR(total)} outflow · Aug
          2026 · clearly labelled, safe to explore.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>
            This is what the dashboard will chew on. Your own data stays
            untouched.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TxnTable transactions={SAMPLE_TXNS} />
        </CardContent>
      </Card>

      <PrivacyNote compact />
      <Separator />
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.push("/upload")}>
            No — upload my own CSV
          </Button>
          <Button onClick={useSample}>
            Continue with sample <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
