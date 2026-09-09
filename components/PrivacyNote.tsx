import { ShieldCheck } from "lucide-react";

export function PrivacyNote({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        {compact
          ? "Private by design: analysis runs in your browser session only. Nothing is stored — closing the tab wipes it."
          : "Private by design. Your transactions stay in this browser tab (session storage only) and are never saved to a database. Anything sent for AI categorisation has account numbers stripped first. Close the tab and it's gone."}
      </p>
    </div>
  );
}
