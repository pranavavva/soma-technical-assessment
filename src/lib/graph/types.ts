import type { Todo, TodoRelationship } from "@/generated/prisma/browser";

/** Branded type for Todo IDs to prevent mixing with arbitrary numbers. */
export type TodoId = number & { readonly __brand: "TodoId" };

/** Wrap a raw number as a TodoId. */
export function todoId(id: number): TodoId {
  return id as TodoId;
}

export type AdjacencyList = Map<TodoId, TodoId[]>;

export type TodoNode = {
  id: Todo["id"];
  title: Todo["title"];
  dueDate: string | null;
} & {
  dependencyIds: TodoId[]; // IDs this todo depends ON
  dependentIds: TodoId[]; // IDs that depend on THIS todo
};

/**
 * Build adjacency list from TodoRelationship rows.
 * Edge direction: dependentId -> dependencyId (points to what it depends on).
 * So graph.get(A) returns the IDs that A depends on.
 */
export function buildAdjacencyList(
  relationships: Pick<TodoRelationship, "dependentId" | "dependencyId">[],
): AdjacencyList {
  const graph: AdjacencyList = new Map();

  relationships.forEach(({ dependentId, dependencyId }) => {
    const dependent = todoId(dependentId);
    const dependency = todoId(dependencyId);

    if (!graph.has(dependent)) graph.set(dependent, []);
    graph.get(dependent)!.push(dependency);

    // Ensure the dependency node also exists in the map
    if (!graph.has(dependency)) graph.set(dependency, []);
  });

  return graph;
}
