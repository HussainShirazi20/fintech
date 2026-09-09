"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ReflectionView } from "@/components/ReflectionView";
import { useFlow } from "@/lib/store";

export default function DashboardClient() {
  const router = useRouter();
  const {
    transactions,
    context,
    features,
    insights,
    model,
    pipelineStage,
    pipelineRunning,
    runDashboard,
    reset,
  } = useFlow();

  useEffect(() => {
    if (transactions.length === 0) {
      router.replace("/upload");
    }
  }, [transactions.length, router]);

  useEffect(() => {
    if (transactions.length > 0 && !features && !pipelineRunning) {
      void runDashboard().then((ok) => {
        if (!ok) router.replace("/context");
      });
    }
  }, [transactions.length, features, pipelineRunning, runDashboard, router]);

  if (transactions.length === 0) return null;

  if (!features) {
    return <LoadingScreen step={pipelineStage} />;
  }

  return (
    <ReflectionView
      transactions={transactions}
      features={features}
      insights={insights}
      context={context}
      model={model}
      onRestart={() => {
        reset();
        router.push("/");
      }}
      onTryOtherContext={() => router.push("/context")}
    />
  );
}
