"use client";

import { ArrowRight, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PrivacyNote } from "./PrivacyNote";

interface Props {
  onSample: () => void;
  onUpload: () => void;
}

export function LandingScreen({ onSample, onUpload }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-10">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          PaisaLens · a money-reflection companion
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          What is your money trying to tell you?
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Drop in a month of transactions, add a little life context, and get
          three grounded insights — not a lecture, a mirror.
        </p>
        <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-3 py-1">What-if simulator</span>
          <span className="rounded-full border px-3 py-1">Leak detector + trip fund</span>
          <span className="rounded-full border px-3 py-1">1-tap share card</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" /> Try sample data
            </CardTitle>
            <CardDescription>
              A realistic synthetic month. Fastest way to see the magic.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={onSample}>
              Load sample month <ArrowRight />
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" /> Use your own data
            </CardTitle>
            <CardDescription>
              Upload a CSV or add transactions manually. Yours stays yours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={onUpload}>
              Upload CSV <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      </div>

      <PrivacyNote />
    </div>
  );
}
