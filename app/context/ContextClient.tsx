"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContextForm } from "@/components/ContextForm";
import { useFlow } from "@/lib/store";

export default function ContextClient() {
  const router = useRouter();
  const { transactions, context, source, saveContext, loadError } = useFlow();

  useEffect(() => {
    if (transactions.length === 0) {
      router.replace(source === "sample" ? "/sample" : "/upload");
    }
  }, [transactions.length, source, router]);

  if (transactions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {loadError && (
        <p className="mx-auto mt-4 w-full max-w-xl rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive">
          {loadError} — please try again.
        </p>
      )}
      <ContextForm
        initial={context}
        onBack={() => router.push(source === "sample" ? "/sample" : "/upload")}
        onNext={(ctx) => {
          saveContext(ctx);
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
