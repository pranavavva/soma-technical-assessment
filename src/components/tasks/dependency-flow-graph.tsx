"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, MarkerType, type Node, type Edge, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TaskNode, type TaskNodeData } from "@/components/tasks/task-node";

type TodoForGraph = {
  id: number;
  title: string;
  status: string;
};

type Relationship = {
  dependentId: number;
  dependencyId: number;
};

type DependencyFlowGraphProps = {
  todos: TodoForGraph[];
  relationships: Relationship[];
  criticalPath: number[];
};

const nodeTypes = { task: TaskNode };

const H_SPACING = 220;
const V_SPACING = 100;
const PAD = 50;

function computeLevels(todos: TodoForGraph[], relationships: Relationship[]): Map<number, number> {
  const ids = new Set(todos.map((t) => t.id));
  const deps = new Map<number, number[]>();

  ids.forEach((id) => deps.set(id, []));
  relationships.forEach((r) => {
    if (ids.has(r.dependentId) && ids.has(r.dependencyId)) {
      deps.get(r.dependentId)!.push(r.dependencyId);
    }
  });

  const levels = new Map<number, number>();
  const visited = new Set<number>();

  function getLevel(id: number): number {
    if (levels.has(id)) return levels.get(id)!;
    if (visited.has(id)) return 0;
    visited.add(id);
    const depIds = deps.get(id) ?? [];
    const level = depIds.length === 0 ? 0 : 1 + Math.max(...depIds.map(getLevel));
    levels.set(id, level);
    return level;
  }

  ids.forEach((id) => getLevel(id));
  return levels;
}

export function DependencyFlowGraph({ todos, relationships, criticalPath }: DependencyFlowGraphProps) {
  const critSet = useMemo(() => new Set(criticalPath), [criticalPath]);

  const { nodes, edges } = useMemo(() => {
    // Only include todos that participate in relationships
    const participatingIds = new Set<number>();
    relationships.forEach((r) => {
      participatingIds.add(r.dependentId);
      participatingIds.add(r.dependencyId);
    });
    const participatingTodos = todos.filter((t) => participatingIds.has(t.id));

    const levels = computeLevels(participatingTodos, relationships);

    // Group by level
    const grouped = new Map<number, TodoForGraph[]>();
    participatingTodos.forEach((todo) => {
      const lv = levels.get(todo.id) ?? 0;
      if (!grouped.has(lv)) grouped.set(lv, []);
      grouped.get(lv)!.push(todo);
    });

    // Compute which nodes have incoming/outgoing edges
    const hasIncomingSet = new Set<number>();
    const hasOutgoingSet = new Set<number>();
    relationships.forEach((r) => {
      hasIncomingSet.add(r.dependentId); // target of edge
      hasOutgoingSet.add(r.dependencyId); // source of edge
    });

    // Compute positions
    const flowNodes: Node[] = [];
    grouped.forEach((group, lv) => {
      group.forEach((todo, i) => {
        flowNodes.push({
          id: String(todo.id),
          type: "task",
          position: { x: lv * H_SPACING + PAD, y: i * V_SPACING + PAD },
          data: {
            title: todo.title,
            status: todo.status,
            isOnCriticalPath: critSet.has(todo.id),
            hasIncoming: hasIncomingSet.has(todo.id),
            hasOutgoing: hasOutgoingSet.has(todo.id),
          } satisfies TaskNodeData,
        });
      });
    });

    const flowEdges: Edge[] = relationships.map((r) => {
      const isCrit = critSet.has(r.dependencyId) && critSet.has(r.dependentId);
      return {
        id: `${r.dependencyId}-${r.dependentId}`,
        source: String(r.dependencyId),
        target: String(r.dependentId),
        type: "smoothstep",
        animated: isCrit,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCrit ? "#3b82f6" : "#71717a",
        },
        style: {
          stroke: isCrit ? "#3b82f6" : "#71717a",
          strokeWidth: isCrit ? 2.5 : 1.5,
          opacity: isCrit ? 1 : 0.4,
        },
      };
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [todos, relationships, critSet]);

  if (relationships.length === 0) {
    return (
      <div className="text-muted-foreground flex h-100 items-center justify-center">
        No dependencies to show. Add dependencies between tasks to see the graph.
      </div>
    );
  }

  return (
    <div className="h-125 w-full rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
        <Controls className="bg-card! border-border! [&>button]:bg-card! [&>button]:border-border! [&>button]:text-foreground! [&>button:hover]:bg-muted! shadow-md!" />
      </ReactFlow>

      <div className="text-muted-foreground flex gap-4 px-4 py-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-3 rounded bg-blue-500" /> Critical path
        </span>
        <span className="flex items-center gap-1">
          <span className="bg-muted-foreground/40 inline-block h-0.5 w-3 rounded" /> Dependency
        </span>
        <span>Scroll to zoom · Drag to pan</span>
      </div>
    </div>
  );
}
