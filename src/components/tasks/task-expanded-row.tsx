"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import DependencySelector from "@/components/DependencySelector";
import { ImageDialog } from "@/components/tasks/image-dialog";
import type { TaskRow } from "@/components/tasks/columns";

type TaskExpandedRowProps = {
  task: TaskRow;
  allTasks: TaskRow[];
  colSpan: number;
};

export function TaskExpandedRow({ task, allTasks, colSpan }: TaskExpandedRowProps) {
  const [imageOpen, setImageOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Convert TaskRow[] to the SerializedTodo shape that DependencySelector expects
  const allTodosForSelector = allTasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    createdAt: t.createdAt,
    dueDate: t.dueDate,
    imageUrl: t.imageUrl,
    dependencyIds: t.dependencyIds,
  }));

  return (
    <>
      <TableRow className="bg-muted/20 hover:bg-muted/20">
        <TableCell colSpan={colSpan}>
          <div className="grid gap-4 py-2 pl-8 sm:grid-cols-[1fr_200px]">
            {/* Left: dependencies + metadata */}
            <div className="space-y-3">
              <div>
                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                  Dependencies
                </div>
                <DependencySelector
                  todoId={task.id}
                  allTodos={allTodosForSelector}
                  currentDependencyIds={task.dependencyIds}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                {task.earliestStartDate && (
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                      Earliest start
                    </div>
                    <span className="text-muted-foreground flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {new Date(task.earliestStartDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {task.isOnCriticalPath && (
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                      Critical path
                    </div>
                    <Badge variant="outline" className="border-orange-500/20 bg-orange-500/10 text-orange-500">
                      yes
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Right: image thumbnail */}
            {task.imageUrl && (
              <div
                className="relative h-30 cursor-pointer overflow-hidden rounded-lg border hover:opacity-80"
                onClick={() => setImageOpen(true)}
              >
                <div className="bg-muted absolute inset-0 animate-pulse object-cover" />
                <Image
                  src={task.imageUrl}
                  alt={task.title}
                  fill
                  className={cn("object-cover", imageLoading && "invisible")}
                  sizes="200px"
                  onLoad={() => setImageLoading(false)}
                />
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>

      {task.imageUrl && (
        <ImageDialog open={imageOpen} onOpenChange={setImageOpen} imageUrl={task.imageUrl} alt={task.title} />
      )}
    </>
  );
}
