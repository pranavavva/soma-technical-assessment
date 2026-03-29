"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, ArrowUpDown } from "lucide-react";
import { StatusBadge } from "@/components/tasks/status-badge";
import { deleteTodo, updateTodoStatus } from "@/app/actions/todo";

export type TaskRow = {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  dueDate: string | null;
  imageUrl: string | null;
  dependencyIds: number[];
  dependencyTitles: string[];
  earliestStartDate: string | null;
  isOnCriticalPath: boolean;
};

export const columns: ColumnDef<TaskRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Task",
    cell: ({ row }) => {
      const depTitles = row.original.dependencyTitles;
      return (
        <div className="max-w-[300px]">
          <div className="truncate font-medium">{row.getValue("title")}</div>
          {depTitles.length > 0 && (
            <div className="text-muted-foreground truncate text-xs">→ {depTitles.join(", ")}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Due date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate") as string | null;
      if (!dueDate) return <span className="text-muted-foreground">—</span>;

      const date = new Date(dueDate);
      const now = new Date();
      const isOverdue = date < now;

      return (
        <span className={isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>
          {date.toLocaleDateString()}
          {isOverdue && " ⚠"}
        </span>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue("dueDate") as string | null;
      const b = rowB.getValue("dueDate") as string | null;
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      const statuses = ["todo", "in progress", "done"];

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Set status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {statuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => updateTodoStatus(task.id, status)}
                    disabled={task.status === status}
                  >
                    <StatusBadge status={status} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteTodo(task.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
