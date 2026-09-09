"use client";

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
import { Trash2 } from "lucide-react";
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
}

export function TxnTable({ transactions, editable, onCategoryChange, onDelete, compact }: Props) {
  const rows = compact ? transactions.slice(0, 8) : transactions;
  return (
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
        {rows.map((t) => (
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
        ))}
      </TableBody>
    </Table>
  );
}
