"use client";

import type { Todo, TodoRelationship } from "@/generated/prisma/browser";

type DependencyGraphProps = {
  todos: Todo[];
  relationships: Pick<TodoRelationship, "dependentId" | "dependencyId">[];
  criticalPath: number[];
};

type GraphNode = { id: number; title: string };

const H_SPACING = 200;
const V_SPACING = 80;
const NODE_W = 150;
const NODE_H = 40;
const PAD = 50;

function computeLevels(todos: GraphNode[], relationships: DependencyGraphProps["relationships"]): Map<number, number> {
  const deps = new Map<number, number[]>(); // id -> list of dependency ids
  const ids = new Set(todos.map((t) => t.id));

  for (const id of ids) deps.set(id, []);
  for (const r of relationships) {
    if (ids.has(r.dependentId) && ids.has(r.dependencyId)) {
      deps.get(r.dependentId)!.push(r.dependencyId);
    }
  }

  const levels = new Map<number, number>();
  const visited = new Set<number>();

  function getLevel(id: number): number {
    if (levels.has(id)) return levels.get(id)!;
    if (visited.has(id)) return 0; // cycle guard
    visited.add(id);
    const depIds = deps.get(id) ?? [];
    const level = depIds.length === 0 ? 0 : 1 + Math.max(...depIds.map(getLevel));
    levels.set(id, level);
    return level;
  }

  for (const id of ids) getLevel(id);
  return levels;
}

export default function DependencyGraph({ todos, relationships, criticalPath }: DependencyGraphProps) {
  if (relationships.length === 0) return null;

  const nodes: GraphNode[] = todos.map((t) => ({ id: t.id, title: t.title }));
  const levels = computeLevels(nodes, relationships);
  const critSet = new Set(criticalPath);

  // Only include nodes that participate in relationships
  const participatingIds = new Set<number>();
  for (const r of relationships) {
    participatingIds.add(r.dependentId);
    participatingIds.add(r.dependencyId);
  }
  const participatingNodes = nodes.filter((t) => participatingIds.has(t.id));

  // Group participating nodes by level
  const grouped = new Map<number, GraphNode[]>();
  for (const node of participatingNodes) {
    const lv = levels.get(node.id) ?? 0;
    if (!grouped.has(lv)) grouped.set(lv, []);
    grouped.get(lv)!.push(node);
  }

  // Position map
  const pos = new Map<number, { x: number; y: number }>();
  let maxX = 0;
  let maxY = 0;
  for (const [lv, group] of grouped) {
    group.forEach((todo, i) => {
      const x = lv * H_SPACING + PAD;
      const y = i * V_SPACING + PAD;
      pos.set(todo.id, { x, y });
      maxX = Math.max(maxX, x + NODE_W);
      maxY = Math.max(maxY, y + NODE_H);
    });
  }

  const vbW = Math.max(300, maxX + PAD);
  const vbH = Math.max(200, maxY + PAD);

  // Check if an edge is on the critical path
  const isCritEdge = (from: number, to: number) => critSet.has(from) && critSet.has(to);

  const truncate = (s: string, max: number) => (s.length > max ? s.slice(0, max - 1) + "\u2026" : s);

  return (
    <div className="mt-6 w-full">
      <h3 className="mb-2 text-lg font-semibold text-white">Dependency Graph</h3>
      <div className="overflow-auto rounded-lg bg-gray-900/40 p-2">
        <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full" style={{ minHeight: 200 }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
              <path d="M0,0 L10,3 L0,6 Z" fill="#9ca3af" />
            </marker>
            <marker
              id="arrow-crit"
              viewBox="0 0 10 6"
              refX="10"
              refY="3"
              markerWidth="8"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L10,3 L0,6 Z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Edges */}
          {relationships.map((r) => {
            const from = pos.get(r.dependencyId);
            const to = pos.get(r.dependentId);
            if (!from || !to) return null;
            const crit = isCritEdge(r.dependencyId, r.dependentId);
            return (
              <line
                key={`${r.dependencyId}-${r.dependentId}`}
                x1={from.x + NODE_W}
                y1={from.y + NODE_H / 2}
                x2={to.x}
                y2={to.y + NODE_H / 2}
                stroke={crit ? "#ef4444" : "#6b7280"}
                strokeWidth={crit ? 2.5 : 1.5}
                markerEnd={crit ? "url(#arrow-crit)" : "url(#arrow)"}
              />
            );
          })}

          {/* Nodes */}
          {participatingNodes.map((todo) => {
            const p = pos.get(todo.id);
            if (!p) return null;
            const crit = critSet.has(todo.id);
            return (
              <g key={todo.id}>
                <rect
                  x={p.x}
                  y={p.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  fill={crit ? "#fef2f2" : "#ffffff"}
                  stroke={crit ? "#ef4444" : "#d1d5db"}
                  strokeWidth={crit ? 2 : 1}
                />
                <text
                  x={p.x + NODE_W / 2}
                  y={p.y + NODE_H / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill={crit ? "#b91c1c" : "#374151"}
                >
                  {truncate(todo.title, 18)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
