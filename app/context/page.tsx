import type { Metadata } from "next";
import ContextClient from "./ContextClient";

export const metadata: Metadata = {
  title: "Your context — PaisaLens",
  description:
    "Add life context — life stage, income pattern, priorities — so insights become yours.",
};

export default function ContextPage() {
  return <ContextClient />;
}
