import type { Category } from "./types";

/**
 * Rule-based categoriser. Keyword rules for ~60 common Indian
 * merchants / UPI handles run first; anything unmatched returns
 * null so the API route can fall back to the LLM.
 */

interface Rule {
  match: RegExp;
  category: Category;
  confidence: number;
}

const RULES: Rule[] = [
  // Food & Dining
  { match: /swiggy|zomato|dominos|pizza|kfc|mcdonald|burger|biryani|chai|sagar|darshini|udupi|restaurant|cafe|coffee|starbucks|third wave|blue tokai|eat|dine|dining|lunch|dinner|breakfast|tiffin|box8|mojo|freshmenu|rebel foods|behrouz|faasos|ovenstory/i, category: "Food & Dining", confidence: 0.92 },
  // Groceries / quick commerce
  { match: /blinkit|zepto|bigbasket|big basket|grofers|dmart|d mart|reliance smart|more supermarket|spencer|nilgiri|nature'?s basket|grocery|kirana|vegetable|sabzi|fruit|milk|amul|nandini|dairy/i, category: "Groceries", confidence: 0.92 },
  // Transport
  { match: /\bola\b|\buber\b|rapido|namma yatri|metro|bmtc|bus|fastag|petrol|diesel|cng|shell|hpcl|bpcl|iocl|indian oil|parking|toll|redbus|abhibus|train|irctc|auto|rickshaw|cab|taxi|fuel/i, category: "Transport", confidence: 0.9 },
  // Shopping
  { match: /amazon|flipkart|myntra|ajio|meesho|nykaa|ikea|decathlon|croma|vijay sales|reliance digital|zara|hm\b|h&m|uniqlo|westside|lifestyle|shoppers stop|firstcry|boat|noise|shopping|mall|store/i, category: "Shopping", confidence: 0.88 },
  // Bills & Utilities
  { match: /electricity|bescom|tata power|adani|bses|bill|mobile|recharge|jio|airtel|\bvi\b|vodafone|broadband|act fibernet|jiofiber|airtel xstream|dth|tata sky|tata play|dish|gas|indane|hp gas|bharat gas|water|bwssb|wifi|rentomojo/i, category: "Bills & Utilities", confidence: 0.9 },
  // Entertainment
  { match: /bookmyshow|bms\b|pvr|inox|cinepolis|movie|cinema|concert|ipl|game|gaming|steam|playstation|xbox|arcade|party|pub|bar|lounge|club|event/i, category: "Entertainment", confidence: 0.88 },
  // Health
  { match: /apollo|fortis|manipal|narayana|hospital|clinic|doctor|pharmacy|1mg|pharmeasy|pharm easy|netmeds|medplus|diagnostic|thyrocare|dr lal|lal pathlab|cultfit|cult\.?fit|gym|yoga|medical|medicine|tablet|health/i, category: "Health", confidence: 0.9 },
  // Education
  { match: /udemy|coursera|unacademy|byju|upgrad|scaler|school|college|university|fee|course|coaching|tuition|exam|book|stationery|crossword|kindle|upsc|gre|gmat|class|learn/i, category: "Education", confidence: 0.88 },
  // Travel
  { match: /makemytrip|mmt\b|goibibo|yatra|cleartrip|indigo|air india|vistara|spicejet|akasa|flight|hotel|oyo|airbnb|bnb|holiday|vacation|trip|tour|travel|hostel|resort/i, category: "Travel", confidence: 0.9 },
  // Rent & Housing
  { match: /\brent\b|house rent|flat rent|pg\b|paying guest|hostel fee|maintenance|society|rwa|noBroker|nobroker|housing|deposit|brokerage|furniture|urban ladder|pepperfry|home centre|homecentre/i, category: "Rent & Housing", confidence: 0.9 },
  // Subscriptions (recurring digital)
  { match: /netflix|spotify|youtube premium|hotstar|jiohotstar|prime video|amazon prime|disney|zee5|sonyliv|aha|icloud|google one|microsoft 365|office 365|notion|figma|github|linkedin premium|audible|kindle unlimited|duolingo|headspace|calm|subscription/i, category: "Subscriptions", confidence: 0.93 },
  // Income
  { match: /salary|payroll|stipend|freelance|consulting|invoice|refund|cashback|reward|interest|dividend|bonus|reimbursement|credited|neft.*salary|imps.*salary/i, category: "Income", confidence: 0.9 },
  // Transfers / finance ops (keep visible, excluded from spend)
  { match: /sip\b|mutual fund|zerodha|groww|upstox|angel one|demat|nps|ppf|epf|fd\b|fixed deposit|rd\b|recurring deposit|gold|sbi life|lic\b|insurance|premium|emi\b|loan|credit card|hdfc card|icici card|sbi card|axis card|upi.*self|self transfer|own account|investment/i, category: "Transfer", confidence: 0.85 },
];

export interface CategoriseResult {
  category: Category;
  confidence: number;
  ruleMatched: boolean;
}

/** Salary/credit heuristics: explicit income words OR large credit. */
export function categoriseDescription(
  description: string,
  type: "credit" | "debit",
  amount: number
): CategoriseResult | null {
  const desc = description.trim();
  for (const rule of RULES) {
    if (rule.match.test(desc)) {
      // A credit that matched a spend rule (e.g. "refund") still leans Income
      if (type === "credit" && /refund|cashback|reimbursement|credited/i.test(desc)) {
        return { category: "Income", confidence: 0.85, ruleMatched: true };
      }
      return { category: rule.category, confidence: rule.confidence, ruleMatched: true };
    }
  }
  if (type === "credit" && amount >= 5000) {
    return { category: "Income", confidence: 0.6, ruleMatched: true };
  }
  return null; // unknown → LLM fallback in the API route
}

/** Strip account numbers / UPI ids before any server call. */
export function sanitiseDescription(desc: string): string {
  return desc
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[card]")
    .replace(/\b\d{9,18}\b/g, "[acct]")
    .replace(/[\w.+-]+@[\w-]+/g, "[upi]")
    .trim();
}

export const ALL_CATEGORIES: Category[] = [
  "Food & Dining",
  "Groceries",
  "Transport",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Rent & Housing",
  "Subscriptions",
  "Income",
  "Transfer",
  "Other",
];
