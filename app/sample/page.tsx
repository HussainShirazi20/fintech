import type { Metadata } from "next";
import { SamplePreview } from "@/components/SamplePreview";

export const metadata: Metadata = {
  title: "Sample month — PaisaLens",
  description:
    "Preview a realistic synthetic month of transactions before generating insights.",
};

export default function SamplePage() {
  return <SamplePreview />;
}
