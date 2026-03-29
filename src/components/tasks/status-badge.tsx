import { Badge } from "@/components/ui/badge";

const statusConfig = {
  todo: { label: "todo", className: "bg-muted text-muted-foreground" },
  "in progress": {
    label: "in progress",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  done: {
    label: "done",
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
} as const;

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.todo;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
