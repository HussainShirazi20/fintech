"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { IncomePattern, LifeStage, UserContext } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIORITY_OPTIONS = [
  "Saving for future",
  "Eating well",
  "Health & fitness",
  "Travel & experiences",
  "Learning & upskilling",
  "Family & home",
  "Entertainment & fun",
  "Shopping & lifestyle",
];

interface Props {
  initial: UserContext;
  onBack: () => void;
  onNext: (ctx: UserContext) => void;
}

export function ContextForm({ initial, onBack, onNext }: Props) {
  const [lifeStage, setLifeStage] = useState<LifeStage>(initial.lifeStage);
  const [incomePattern, setIncomePattern] = useState<IncomePattern>(initial.incomePattern);
  const [priorities, setPriorities] = useState<string[]>(initial.priorities);
  const [error, setError] = useState<string | null>(null);

  function toggle(p: string) {
    setPriorities((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p);
      if (prev.length >= 3) return prev;
      return [...prev, p];
    });
  }

  function submit() {
    if (priorities.length === 0) {
      setError("Pick at least 1 priority — it shapes your insights.");
      return;
    }
    setError(null);
    onNext({ lifeStage, incomePattern, priorities });
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 py-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">A little context, please</h2>
        <p className="text-sm text-muted-foreground">
          Same numbers, different life — different insights. This is what makes them yours.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Life stage</CardTitle>
          <CardDescription>Where are you right now?</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={lifeStage} onValueChange={(v) => setLifeStage(v as LifeStage)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="professional">Working professional</SelectItem>
              <SelectItem value="family">Earning for a family</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Income pattern</CardTitle>
          <CardDescription>How does money usually come in?</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={incomePattern} onValueChange={(v) => setIncomePattern(v as IncomePattern)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular salary</SelectItem>
              <SelectItem value="irregular">Irregular / freelance</SelectItem>
              <SelectItem value="mixed">A mix of both</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top priorities <span className="font-normal text-muted-foreground">(pick up to 3)</span></CardTitle>
          <CardDescription>What should your money be serving?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {PRIORITY_OPTIONS.map((p) => {
            const active = priorities.includes(p);
            return (
              <Badge
                key={p}
                variant={active ? "default" : "outline"}
                className={cn("cursor-pointer px-3 py-1.5 text-sm", !active && "hover:bg-accent")}
                onClick={() => toggle(p)}
              >
                {p}
              </Badge>
            );
          })}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Separator />
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft /> Back</Button>
        <Button onClick={submit}>See my reflection <ArrowRight /></Button>
      </div>
    </div>
  );
}
