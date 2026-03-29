import type { AdjacencyList, TodoId } from "@/lib/graph/types";

/**
 * Kahn's algorithm. Returns node IDs in dependency-first order
 * (dependencies come before their dependents).
 *
 * Since graph edges point from dependent -> dependency (A depends on B
 * means A -> B), we need B before A. In Kahn's terms, B has an in-edge
 * from A in the original graph, but we want the reverse: nodes with no
 * dependencies (out-degree 0 in the original, or in-degree 0 in the
 * reversed graph) come first.
 *
 * We reverse the edge direction for Kahn's: build a reverse graph where
 * edges go dependency -> dependent, then run standard Kahn's on that.
 */
export function topologicalSort(graph: AdjacencyList): TodoId[] {
  // Collect all nodes
  const allNodes = new Set<TodoId>(Array.from(graph.keys()));

  // Build reverse graph (dependency -> dependents) and compute in-degrees
  // In the reverse graph, an edge from B -> A means A depends on B.
  // In-degree in the reverse graph = number of dependencies a node has.
  const reverseGraph = new Map<TodoId, TodoId[]>();
  const inDegree = new Map<TodoId, number>();

  allNodes.forEach((nodeId) => {
    reverseGraph.set(nodeId, []);
    inDegree.set(nodeId, 0);
  });

  graph.forEach((dependencies, dependent) => {
    dependencies.forEach((dependency) => {
      // Reverse edge: dependency -> dependent
      reverseGraph.get(dependency)!.push(dependent);
      inDegree.set(dependent, (inDegree.get(dependent) ?? 0) + 1);
    });
  });

  // Start with nodes that have no dependencies (in-degree 0 in reverse graph)
  const queue: TodoId[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  const result: TodoId[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    (reverseGraph.get(current) ?? []).forEach((neighbor) => {
      const newDegree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    });
  }

  return result;
}
