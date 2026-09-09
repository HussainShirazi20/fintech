import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatINR } from "@/lib/features";

interface Props {
  score: number;
  alignedSpend: number;
  totalSpend: number;
  priorities: string[];
}

export function AlignmentMeter({ score, alignedSpend, totalSpend, priorities }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Priority alignment</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold">{score}%</span>
          <span className="text-sm text-muted-foreground">
            {formatINR(alignedSpend)} of {formatINR(totalSpend)} serves your priorities
          </span>
        </div>
        <Progress value={score} />
        <p className="text-xs text-muted-foreground">
          Priorities: {priorities.join(" · ")}
        </p>
      </CardContent>
    </Card>
  );
}
