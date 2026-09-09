"use client";

import { useRouter } from "next/navigation";
import { UploadScreen } from "@/components/UploadScreen";
import { useFlow } from "@/lib/store";

export default function UploadClient() {
  const router = useRouter();
  const { transactions, setTransactions } = useFlow();

  return (
    <UploadScreen
      transactions={transactions}
      setTransactions={(t) => setTransactions(t, "upload")}
      onBack={() => router.push("/")}
      onNext={() => router.push("/context")}
    />
  );
}
