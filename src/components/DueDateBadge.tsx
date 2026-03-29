export type DueDateBadgeProps = {
  dueDate: string | null;
};

export default function DueDateBadge({ dueDate }: DueDateBadgeProps) {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  const now = new Date();
  const isOverdue = date < now;

  return (
    <span className={isOverdue ? "text-sm font-semibold text-red-500" : "text-sm text-gray-500"}>
      {isOverdue && "Overdue: "}
      {date.toLocaleDateString()}
    </span>
  );
}
