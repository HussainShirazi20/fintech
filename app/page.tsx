"use client";

import { useRouter } from "next/navigation";
import { LandingScreen } from "@/components/LandingScreen";

export default function Home() {
  const router = useRouter();
  return (
    <LandingScreen
      onSample={() => router.push("/sample")}
      onUpload={() => router.push("/upload")}
    />
  );
}
