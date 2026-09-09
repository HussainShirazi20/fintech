import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — PaisaLens",
  description:
    "Your month, reflected — category breakdown, spending rhythm, priority alignment, and three grounded insights.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
