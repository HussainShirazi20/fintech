"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft, ChevronRight, ArrowDownToLine, ArrowUpFromLine, ListFilter } from "lucide-react";
import { ALL_CATEGORIES } from "@/lib/categories";
import { formatINR } from "@/lib/features";
import type { Category, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  transactions: Transaction[];
  editable?: boolean;
  onCategoryChange?: (id: string, category: Category) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
  paginate?: boolean;
  showTypeFilter?: boolean;
}

const PAGE_OPTIONS = [8, 10, 15, 25];

type TypeFilter = "all" | "credit" | "debit";

export function TxnTable({ transactions, editable, onCategoryChange, onDelete, compact, paginate = true, showTypeFilter }: Props) {
  const defaultSize = compact ? 8 : 10;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultSize);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const filterVisible = showTypeFilter ?? paginate;

  const counts = useMemo(() => {
    let credit = 0;
    for (const t of transactions) if (t.type === "credit") credit += 1;
    return { all: transactions.length, credit, debit: transactions.length - credit };
  }, [transactions]);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return transactions;
    return transactions.filter((t) => t.type === typeFilter);
  }, [transactions, typeFilter]);

  // Reset pagination when the data, filter, or density changes.
  // Render-time adjustment (the recommended replacement for sync setState
  // inside effects) — safePage clamping below covers any stragglers.
  const [prevResetKey, setPrevResetKey] = useState<string | null>(null);
  const resetKey = `${compact}-${transactions.length}-${typeFilter}`;
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setPageSize(defaultSize);
    setPage(0);
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const rows = useMemo(() => {
    if (!paginate) return filtered;
    const start = safePage * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize, paginate]);

  const from = filtered.length === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min(filtered.length, safePage * pageSize + rows.length);

  const goTo = (p: number) => setPage(Math.max(0, Math.min(pageCount - 1, p)));

  // Compact page-number window (max 5 buttons)
  const pageNums = useMemo(() => {
    const window = 5;
    let start = Math.max(0, safePage - Math.floor(window / 2));
    const end = Math.min(pageCount, start + window);
    start = Math.max(0, end - window);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [safePage, pageCount]);

  return (
    <div className="flex flex-col gap-2">
    {filterVisible && transactions.length > 0 && (
      <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by transaction type">
        <span className="mr-1 flex items-center gap-1 text-xs text-muted-foreground">
          <ListFilter className="h-3.5 w-3.5" /> Show
        </span>
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs tabular-nums"
          onClick={() => setTypeFilter("all")}
          role="tab"
          aria-selected={typeFilter === "all"}
        >
          All ({counts.all})
        </Button>
        <Button
          variant={typeFilter === "credit" ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs tabular-nums"
          onClick={() => setTypeFilter("credit")}
          role="tab"
          aria-selected={typeFilter === "credit"}
        >
          <ArrowDownToLine className="h-3.5 w-3.5" /> Money in ({counts.credit})
        </Button>
        <Button
          variant={typeFilter === "debit" ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs tabular-nums"
          onClick={() => setTypeFilter("debit")}
          role="tab"
          aria-selected={typeFilter === "debit"}
        >
          <ArrowUpFromLine className="h-3.5 w-3.5" /> Money out ({counts.debit})
        </Button>
      </div>
    )}
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          {editable && <TableHead className="w-10" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={editable ? 5 : 4} className="py-6 text-center text-sm text-muted-foreground">
              No {typeFilter === "all" ? "" : typeFilter === "credit" ? "money-in " : "money-out "}transactions here.
            </TableCell>
          </TableRow>
        ) : (
        rows.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="whitespace-nowrap text-muted-foreground">{t.date}</TableCell>
            <TableCell className="max-w-[220px] truncate font-medium">{t.description}</TableCell>
            <TableCell>
              {editable && onCategoryChange ? (
                <Select value={t.category ?? "Other"} onValueChange={(v) => onCategoryChange(t.id, v as Category)}>
                  <SelectTrigger className="h-7 w-[150px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary">{t.category ?? "—"}</Badge>
              )}
            </TableCell>
            <TableCell className={cn("text-right font-medium", t.type === "credit" ? "text-green-600" : "")}>
              {t.type === "credit" ? "+" : "−"}{formatINR(t.amount)}
            </TableCell>
            {editable && onDelete && (
              <TableCell>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(t.id)} aria-label="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))
        )}
      </TableBody>
    </Table>
    {paginate && filtered.length > 0 && (
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="text-xs text-muted-foreground tabular-nums">
          Showing {from}–{to} of {filtered.length}
          {typeFilter !== "all" && ` (filtered from ${transactions.length})`}
        </p>
        <div className="flex items-center gap-1.5">
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
            <SelectTrigger className="h-7 w-[76px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => goTo(safePage - 1)} disabled={safePage === 0} aria-label="Previous page">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {pageNums.map((p) => (
            <Button
              key={p}
              variant={p === safePage ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7 text-xs tabular-nums"
              onClick={() => goTo(p)}
              aria-label={`Page ${p + 1}`}
              aria-current={p === safePage ? "page" : undefined}
            >
              {p + 1}
            </Button>
          ))}
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => goTo(safePage + 1)} disabled={safePage >= pageCount - 1} aria-label="Next page">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )}
    </div>
  );
}
