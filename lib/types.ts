export type TxnType = "credit" | "debit";

export type Category =
  | "Food & Dining"
  | "Groceries"
  | "Transport"
  | "Shopping"
  | "Bills & Utilities"
  | "Entertainment"
  | "Health"
  | "Education"
  | "Travel"
  | "Rent & Housing"
  | "Subscriptions"
  | "Income"
  | "Transfer"
  | "Other";

export interface Transaction {
  id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  amount: number; // always positive; direction given by `type`
  type: TxnType;
  category?: Category;
  confidence?: number; // 0..1, set by the categoriser
  needsReview?: boolean;
}

export type LifeStage = "student" | "professional" | "family";
export type IncomePattern = "regular" | "irregular" | "mixed";

export interface UserContext {
  lifeStage: LifeStage;
  incomePattern: IncomePattern;
  priorities: string[]; // 2-3 short labels chosen by the user
}

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
}

export interface Features {
  income: number;
  outflow: number;
  savingsRate: number; // 0..1 (can be negative)
  categoryTotals: CategoryTotal[];
  weekdaySpend: number;
  weekendSpend: number;
  firstHalfSpend: number; // days 1-15
  secondHalfSpend: number; // days 16-31
  subscriptions: { description: string; amount: number; count: number }[];
  topExpenses: { id: string; description: string; amount: number; date: string }[];
  incomeRegularity: "regular" | "irregular" | "single" | "none";
  txnCount: number;
  periodStart: string;
  periodEnd: string;
}

export interface Insight {
  id: string;
  observation: string;
  whyItMatters: string;
  action: string;
  txnIds: string[];
  amounts: number[];
}

export type FlowStep =
  | "landing"
  | "upload"
  | "context"
  | "loading"
  | "reflection";
