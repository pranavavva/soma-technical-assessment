import type { AdjacencyList, TodoId } from "@/lib/graph/types";

/**
 * Returns true if adding edge (fromId -> toId) would create a cycle.
 * "fromId depends on toId" -- so we check: is fromId already reachable
 * from toId by following existing dependency edges? If yes, adding this
 * edge would close a loop.
 */
export function wouldCreateCycle(graph: AdjacencyList, fromId: TodoId, toId: TodoId): boolean {
  // Self-loop is always a cycle
  if (fromId === toId) return true;

  // DFS from toId following existing edges. If we reach fromId, a cycle
  // would be created.
  const visited = new Set<TodoId>();
  const stack: TodoId[] = [toId];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current === fromId) return true;
    if (visited.has(current)) continue;

    visited.add(current);

    const neighbors = graph.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return false;
}
