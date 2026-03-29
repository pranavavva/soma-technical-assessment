import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, AlertCircle } from "lucide-react";

export type DueDateBadgeProps = {
  dueDate: string | null;
};

export default function DueDateBadge({ dueDate }: DueDateBadgeProps) {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isApproaching = diffDays >= 0 && diffDays <= 3;

  if (isOverdue) {
    return (
      <Badge variant="destructive" className="text-[10px]">
        <AlertCircle className="mr-1 h-3 w-3" />
        Overdue: {date.toLocaleDateString()}
      </Badge>
    );
  }

  if (isApproaching) {
    return (
      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-[10px] text-amber-700">
        <AlertTriangle className="mr-1 h-3 w-3" />
        {date.toLocaleDateString()}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-[10px]">
      <Calendar className="mr-1 h-3 w-3" />
      {date.toLocaleDateString()}
    </Badge>
  );
}
