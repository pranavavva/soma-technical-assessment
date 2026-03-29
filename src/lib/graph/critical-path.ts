import type { AdjacencyList, TodoId, TodoNode } from "@/lib/graph/types";
import { topologicalSort } from "@/lib/graph/topological-sort";

/**
 * For each todo: earliest start = max due date among all transitive dependencies.
 * If a dependency has no due date, it doesn't constrain the start.
 * Returns a map of todoId -> earliest start date (or null if unconstrained).
 */
export function calculateEarliestStartDates(todos: TodoNode[], graph: AdjacencyList): Map<TodoId, Date | null> {
  const todoMap = new Map<TodoId, TodoNode>();
  for (const todo of todos) {
    todoMap.set(todo.id as TodoId, todo);
  }

  const sorted = topologicalSort(graph);
  const earliestStart = new Map<TodoId, Date | null>();

  // Walk in topological order (dependencies first)
  for (const nodeId of sorted) {
    const dependencies = graph.get(nodeId) ?? [];
    let maxDate: Date | null = null;

    for (const depId of dependencies) {
      const depNode = todoMap.get(depId);
      const depDueDate = depNode?.dueDate ?? null;
      const depEarliestStart = earliestStart.get(depId) ?? null;

      // The constraint from this dependency is the later of its due date
      // and its own earliest start date
      const candidates = [depDueDate, depEarliestStart].filter((d): d is Date => d !== null);
      for (const candidate of candidates) {
        if (maxDate === null || candidate.getTime() > maxDate.getTime()) {
          maxDate = candidate;
        }
      }
    }

    earliestStart.set(nodeId, maxDate);
  }

  return earliestStart;
}

/**
 * Critical path = longest chain through the dependency graph (by node count).
 * Returns the IDs of nodes on the critical path, in order.
 */
export function getCriticalPath(todos: TodoNode[], graph: AdjacencyList): TodoId[] {
  const sorted = topologicalSort(graph);

  // For each node, compute the longest path (by node count) ending at that node
  const longestPathLen = new Map<TodoId, number>();
  const predecessor = new Map<TodoId, TodoId | null>();

  for (const nodeId of sorted) {
    longestPathLen.set(nodeId, 1);
    predecessor.set(nodeId, null);
  }

  // Walk in topological order. For each node, update its dependents.
  // Build reverse graph: dependency -> dependents
  const reverseGraph = new Map<TodoId, TodoId[]>();
  for (const nodeId of sorted) {
    reverseGraph.set(nodeId, []);
  }
  graph.forEach((dependencies, dependent) => {
    for (const dependency of dependencies) {
      if (!reverseGraph.has(dependency)) {
        reverseGraph.set(dependency, []);
      }
      reverseGraph.get(dependency)!.push(dependent);
    }
  });

  for (const nodeId of sorted) {
    const currentLen = longestPathLen.get(nodeId)!;
    for (const dependent of reverseGraph.get(nodeId) ?? []) {
      const newLen = currentLen + 1;
      if (newLen > (longestPathLen.get(dependent) ?? 1)) {
        longestPathLen.set(dependent, newLen);
        predecessor.set(dependent, nodeId);
      }
    }
  }

  // Find the node with the longest path
  let maxLen = 0;
  let endNode: TodoId | null = null;
  longestPathLen.forEach((len, nodeId) => {
    if (len > maxLen) {
      maxLen = len;
      endNode = nodeId;
    }
  });

  if (endNode === null) return [];

  // Trace back the path
  const path: TodoId[] = [];
  let current: TodoId | null = endNode;
  while (current !== null) {
    path.push(current);
    current = predecessor.get(current) ?? null;
  }

  // Path is from end to start, reverse to get dependency-first order
  path.reverse();
  return path;
}
