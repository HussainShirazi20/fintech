import type { Metadata } from "next";
import UploadClient from "./UploadClient";

export const metadata: Metadata = {
  title: "Upload transactions — PaisaLens",
  description:
    "Upload a CSV statement or add transactions manually. Your data stays in this browser tab.",
};

export default function UploadPage() {
  return <UploadClient />;
}
