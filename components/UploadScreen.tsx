"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { ArrowLeft, ArrowRight, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TxnTable } from "./TxnTable";
import { PrivacyNote } from "./PrivacyNote";
import type { Category, Transaction, TxnType } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  setTransactions: (txns: Transaction[]) => void;
  onBack: () => void;
  onNext: () => void;
}

let manualCounter = 0;

export function UploadScreen({ transactions, setTransactions, onBack, onNext }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<TxnType>("debit");

  function handleFile(file: File) {
    setError(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        try {
          const rows = res.data;
          if (rows.length === 0) throw new Error("empty file");
          const txns: Transaction[] = rows.map((r, i) => {
            const keys = Object.fromEntries(
              Object.entries(r).map(([k, v]) => [k.trim().toLowerCase(), v])
            );
            const description = (keys["description"] ?? keys["narration"] ?? keys["details"] ?? "").trim();
            const amountRaw = (keys["amount"] ?? keys["debit"] ?? "").toString().replace(/[,₹\s]/g, "");
            const amount = Math.abs(Number(amountRaw));
            const dateRaw = (keys["date"] ?? "").trim();
            const typeRaw = (keys["type"] ?? "").toLowerCase();
            if (!description || !Number.isFinite(amount) || amount <= 0 || !dateRaw) {
              throw new Error(`row ${i + 1} needs date, description, amount`);
            }
            const parsedDate = new Date(dateRaw);
            if (Number.isNaN(parsedDate.getTime())) throw new Error(`row ${i + 1}: bad date`);
            const txnType: TxnType =
              typeRaw.startsWith("cr") || typeRaw === "credit" ? "credit" : "debit";
            return {
              id: `csv-${Date.now()}-${i}`,
              date: parsedDate.toISOString().slice(0, 10),
              description,
              amount,
              type: txnType,
            };
          });
          setTransactions([...transactions, ...txns]);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not parse that CSV");
        }
      },
      error: () => setError("Could not read that file"),
    });
  }

  function addManual() {
    const amt = Math.abs(Number(amount));
    if (!desc.trim() || !Number.isFinite(amt) || amt <= 0 || !date) {
      setError("Add a description, a valid amount and a date.");
      return;
    }
    setError(null);
    manualCounter += 1;
    setTransactions([
      ...transactions,
      { id: `manual-${Date.now()}-${manualCounter}`, date, description: desc.trim(), amount: amt, type },
    ]);
    setDesc("");
    setAmount("");
  }

  function updateTxn(id: string, patch: Partial<Transaction>) {
    setTransactions(transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add your transactions</h2>
        <p className="text-sm text-muted-foreground">
          CSV columns: <code className="rounded bg-muted px-1">date,description,amount,type</code> — or type
          them in below. Fix any category before continuing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload CSV</CardTitle>
          <CardDescription>Bank or UPI statement exported as CSV.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              Choose CSV file
            </Button>
            <Button variant="ghost" asChild>
              <a href="/sample.csv" download>
                <Download /> sample.csv
              </a>
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add manually</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[1fr_140px_150px_130px_auto]">
          <div className="grid gap-1.5">
            <Label htmlFor="m-desc">Description</Label>
            <Input id="m-desc" placeholder="Swiggy dinner" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="m-amt">Amount ₹</Label>
            <Input id="m-amt" inputMode="decimal" placeholder="450" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="m-date">Date</Label>
            <Input id="m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as TxnType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="debit">Spent</SelectItem>
                <SelectItem value="credit">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button size="icon" onClick={addManual} aria-label="Add transaction"><Plus /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Transactions {transactions.length > 0 && `(${transactions.length})`}
          </CardTitle>
          <CardDescription>Tap a category to correct it — the app learns from you.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing here yet — upload a CSV or add your first transaction.
            </p>
          ) : (
            <TxnTable
              transactions={transactions}
              editable
              onCategoryChange={(id, category: Category) =>
                updateTxn(id, { category, confidence: 1 })
              }
              onDelete={(id) => setTransactions(transactions.filter((t) => t.id !== id))}
            />
          )}
        </CardContent>
      </Card>

      <PrivacyNote compact />
      <Separator />
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft /> Back</Button>
        <Button onClick={onNext} disabled={transactions.length === 0}>
          Continue <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
