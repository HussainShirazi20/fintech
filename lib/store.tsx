"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Features, Insight, Transaction, UserContext } from "./types";
import { runPipeline } from "./pipeline";
import { SAMPLE_TXNS } from "./sample-data";

export type Source = "sample" | "upload" | null;

export const DEFAULT_CTX: UserContext = {
  lifeStage: "professional",
  incomePattern: "regular",
  priorities: [],
};

function loadSession<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveSession(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota — non-fatal */
  }
}

interface FlowContextValue {
  transactions: Transaction[];
  context: UserContext;
  source: Source;
  features: Features | null;
  insights: Insight[];
  model: string;
  pipelineStage: number;
  pipelineRunning: boolean;
  loadError: string | null;
  setTransactions: (txns: Transaction[], source?: Exclude<Source, null>) => void;
  loadSample: () => void;
  saveContext: (ctx: UserContext) => void;
  runDashboard: () => Promise<boolean>;
  reset: () => void;
}

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactionsState] = useState<Transaction[]>(() =>
    loadSession<Transaction[]>("paisalens:txns", [])
  );
  const [context, setContextState] = useState<UserContext>(() =>
    loadSession<UserContext>("paisalens:ctx", DEFAULT_CTX)
  );
  const [source, setSourceState] = useState<Source>(() =>
    loadSession<Source>("paisalens:source", null)
  );
  const [features, setFeatures] = useState<Features | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [model, setModel] = useState("");
  const [pipelineStage, setPipelineStage] = useState(0);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ranKey, setRanKey] = useState<string | null>(null);

  useEffect(() => saveSession("paisalens:txns", transactions), [transactions]);
  useEffect(() => saveSession("paisalens:ctx", context), [context]);
  useEffect(() => saveSession("paisalens:source", source), [source]);

  const setTransactions = useCallback(
    (txns: Transaction[], nextSource?: Exclude<Source, null>) => {
      setTransactionsState(txns);
      if (nextSource) setSourceState(nextSource);
      // New data invalidates previous results
      setFeatures(null);
      setInsights([]);
      setModel("");
      setRanKey(null);
    },
    []
  );

  const loadSample = useCallback(() => {
    setTransactionsState(SAMPLE_TXNS);
    setSourceState("sample");
    setFeatures(null);
    setInsights([]);
    setModel("");
    setRanKey(null);
  }, []);

  const saveContext = useCallback((ctx: UserContext) => {
    setContextState(ctx);
    // New context invalidates previous results
    setFeatures(null);
    setInsights([]);
    setModel("");
    setRanKey(null);
  }, []);

  const runDashboard = useCallback(async () => {
    const key = JSON.stringify({
      txns: transactions.map((t) => t.id),
      ctx: context,
      src: source,
    });
    if (ranKey === key) return true;
    setPipelineRunning(true);
    setPipelineStage(0);
    setLoadError(null);
    try {
      const res = await runPipeline(
        transactions,
        context,
        source === "sample",
        setPipelineStage
      );
      setTransactionsState(res.transactions);
      setFeatures(res.features);
      setInsights(res.insights);
      setModel(res.model);
      setRanKey(key);
      return true;
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Something went wrong");
      return false;
    } finally {
      setPipelineRunning(false);
    }
  }, [transactions, context, source, ranKey]);

  const reset = useCallback(() => {
    setTransactionsState([]);
    setContextState(DEFAULT_CTX);
    setSourceState(null);
    setFeatures(null);
    setInsights([]);
    setModel("");
    setRanKey(null);
    setLoadError(null);
    try {
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      transactions,
      context,
      source,
      features,
      insights,
      model,
      pipelineStage,
      pipelineRunning,
      loadError,
      setTransactions,
      loadSample,
      saveContext,
      runDashboard,
      reset,
    }),
    [
      transactions,
      context,
      source,
      features,
      insights,
      model,
      pipelineStage,
      pipelineRunning,
      loadError,
      setTransactions,
      loadSample,
      saveContext,
      runDashboard,
      reset,
    ]
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow(): FlowContextValue {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside FlowProvider");
  return ctx;
}
