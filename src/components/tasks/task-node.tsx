"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/tasks/status-badge";

export type TaskNodeData = {
  title: string;
  status: string;
  isOnCriticalPath: boolean;
  hasIncoming: boolean;
  hasOutgoing: boolean;
};

export function TaskNode({ data }: NodeProps) {
  const nodeData = data as TaskNodeData;
  const { title, status, isOnCriticalPath, hasIncoming, hasOutgoing } = nodeData;

  return (
    <div
      className={cn(
        "bg-card rounded-lg border px-3 py-2 shadow-sm",
        isOnCriticalPath ? "border-blue-500 shadow-md shadow-blue-500/20" : "border-border",
      )}
      style={{ minWidth: 140 }}
    >
      {hasIncoming && <Handle type="target" position={Position.Left} className="bg-muted-foreground! h-2! w-2!" />}
      <div className="truncate text-xs font-medium" style={{ maxWidth: 120 }}>
        {title}
      </div>
      <div className="mt-1">
        <StatusBadge status={status} />
      </div>
      {hasOutgoing && <Handle type="source" position={Position.Right} className="bg-muted-foreground! h-2! w-2!" />}
    </div>
  );
}
