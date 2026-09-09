import type { Transaction } from "./types";

/**
 * ~40 realistic SYNTHETIC Indian transactions, clearly labelled.
 * One month window; used by "Try sample data" + demo-safety cache.
 */
export const SAMPLE_TXNS: Transaction[] = [
  { id: "txn-01", date: "2026-08-01", description: "Salary credit ACME Pvt Ltd", amount: 65000, type: "credit", category: "Income", confidence: 0.95 },
  { id: "txn-02", date: "2026-08-01", description: "House rent UPI", amount: 15000, type: "debit", category: "Rent & Housing", confidence: 0.9 },
  { id: "txn-03", date: "2026-08-02", description: "DMart grocery run", amount: 2840, type: "debit", category: "Groceries", confidence: 0.92 },
  { id: "txn-04", date: "2026-08-02", description: "Swiggy dinner order", amount: 649, type: "debit", category: "Food & Dining", confidence: 0.92 },
  { id: "txn-05", date: "2026-08-03", description: "Uber trip HSR to Indiranagar", amount: 312, type: "debit", category: "Transport", confidence: 0.9 },
  { id: "txn-06", date: "2026-08-03", description: "Netflix monthly plan", amount: 649, type: "debit", category: "Subscriptions", confidence: 0.93 },
  { id: "txn-07", date: "2026-08-04", description: "BESCOM electricity bill", amount: 1875, type: "debit", category: "Bills & Utilities", confidence: 0.9 },
  { id: "txn-08", date: "2026-08-05", description: "Blinkit late night snacks", amount: 432, type: "debit", category: "Groceries", confidence: 0.92 },
  { id: "txn-09", date: "2026-08-06", description: "Zomato lunch", amount: 389, type: "debit", category: "Food & Dining", confidence: 0.92 },
  { id: "txn-10", date: "2026-08-07", description: "Petrol HP pump", amount: 1500, type: "debit", category: "Transport", confidence: 0.9 },
  { id: "txn-11", date: "2026-08-08", description: "Amazon.in headphones", amount: 2499, type: "debit", category: "Shopping", confidence: 0.88 },
  { id: "txn-12", date: "2026-08-09", description: "PVR movie tickets x2", amount: 890, type: "debit", category: "Entertainment", confidence: 0.88 },
  { id: "txn-13", date: "2026-08-09", description: "Third Wave Coffee", amount: 540, type: "debit", category: "Food & Dining", confidence: 0.92 },
  { id: "txn-14", date: "2026-08-10", description: "Jio prepaid recharge", amount: 399, type: "debit", category: "Bills & Utilities", confidence: 0.9 },
  { id: "txn-15", date: "2026-08-11", description: "Apollo Pharmacy", amount: 720, type: "debit", category: "Health", confidence: 0.9 },
  { id: "txn-16", date: "2026-08-12", description: "Zepto groceries", amount: 915, type: "debit", category: "Groceries", confidence: 0.92 },
  { id: "txn-17", date: "2026-08-13", description: "Rapido bike ride", amount: 85, type: "debit", category: "Transport", confidence: 0.9 },
  { id: "txn-18", date: "2026-08-14", description: "Myntra sale order", amount: 1799, type: "debit", category: "Shopping", confidence: 0.88 },
  { id: "txn-19", date: "2026-08-15", description: "Freelance invoice payout", amount: 12000, type: "credit", category: "Income", confidence: 0.9 },
  { id: "txn-20", date: "2026-08-15", description: "SIP HDFC Flexicap", amount: 5000, type: "debit", category: "Transfer", confidence: 0.85 },
  { id: "txn-21", date: "2026-08-16", description: "Cultfit monthly", amount: 1179, type: "debit", category: "Health", confidence: 0.9 },
  { id: "txn-22", date: "2026-08-16", description: "Swiggy late night biryani", amount: 459, type: "debit", category: "Food & Dining", confidence: 0.92 },
  { id: "txn-23", date: "2026-08-17", description: "Metro smart card topup", amount: 500, type: "debit", category: "Transport", confidence: 0.9 },
  { id: "txn-24", date: "2026-08-18", description: "Udemy course sale", amount: 549, type: "debit", category: "Education", confidence: 0.88 },
  { id: "txn-25", date: "2026-08-19", description: "BigBasket monthly stockup", amount: 3420, type: "debit", category: "Groceries", confidence: 0.92 },
  { id: "txn-26", date: "2026-08-20", description: "BookMyShow concert", amount: 1999, type: "debit", category: "Entertainment", confidence: 0.88 },
  { id: "txn-27", date: "2026-08-21", description: "Indane gas refill", amount: 1106, type: "debit", category: "Bills & Utilities", confidence: 0.9 },
  { id: "txn-28", date: "2026-08-22", description: "Zomato dinner", amount: 715, type: "debit", category: "Food & Dining", confidence: 0.92 },
  { id: "txn-29", date: "2026-08-23", description: "Decathlon running shoes", amount: 2999, type: "debit", category: "Shopping", confidence: 0.88 },
  { id: "txn-30", date: "2026-08-23", description: "Spotify Premium", amount: 119, type: "debit", category: "Subscriptions", confidence: 0.93 },
  { id: "txn-31", date: "2026-08-24", description: "1mg lab test", amount: 899, type: "debit", category: "Health", confidence: 0.9 },
  { id: "txn-32", date: "2026-08-24", description: "Ola airport drop", amount: 640, type: "debit", category: "Transport", confidence: 0.9 },
  { id: "txn-33", date: "2026-08-25", description: "IndiGo BLR-DEL flight", amount: 5499, type: "debit", category: "Travel", confidence: 0.9 },
  { id: "txn-34", date: "2026-08-26", description: "OYO stay Delhi 1N", amount: 1899, type: "debit", category: "Travel", confidence: 0.9 },
  { id: "txn-35", date: "2026-08-27", description: "Swiggy lunch", amount: 329, type: "debit", category: "Food & Dining", confidence: 0.92 },
  { id: "txn-36", date: "2026-08-27", description: "ACT Fibernet bill", amount: 999, type: "debit", category: "Bills & Utilities", confidence: 0.9 },
  { id: "txn-37", date: "2026-08-28", description: "Flipkart phone case", amount: 499, type: "debit", category: "Shopping", confidence: 0.88 },
  { id: "txn-38", date: "2026-08-29", description: "Credit card payment HDFC", amount: 12000, type: "debit", category: "Transfer", confidence: 0.85 },
  { id: "txn-39", date: "2026-08-29", description: "Blinkit party supplies", amount: 1240, type: "debit", category: "Groceries", confidence: 0.92 },
  { id: "txn-40", date: "2026-08-30", description: "Domino's family dinner", amount: 999, type: "debit", category: "Food & Dining", confidence: 0.92 },
  { id: "txn-41", date: "2026-08-30", description: "Cashback Amazon Pay", amount: 250, type: "credit", category: "Income", confidence: 0.85 },
  { id: "txn-42", date: "2026-08-31", description: "YouTube Premium", amount: 139, type: "debit", category: "Subscriptions", confidence: 0.93 },
];

export const SAMPLE_CSV_HEADER = "date,description,amount,type";
