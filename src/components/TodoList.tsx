"use client";

import type { Todo } from "@/generated/prisma/browser";
import TodoItem from "@/components/TodoItem";

/**
 * Todo with Date fields serialized to ISO strings.
 * Next.js automatically serializes Date objects when passing props from
 * Server Components to Client Components, so at runtime these are strings.
 */
export type SerializedTodo = Omit<Todo, "createdAt" | "dueDate"> & {
  createdAt: string;
  dueDate: string | null;
};

export type TodoListProps = {
  todos: Todo[];
  earliestStartDates: Record<number, string | null>;
  criticalPath: number[];
  dependencyIdsMap: Record<number, number[]>;
};

export default function TodoList({ todos, earliestStartDates, criticalPath, dependencyIdsMap }: TodoListProps) {
  // Next.js serializes Date -> string when crossing the server/client boundary.
  // Cast here since TypeScript doesn't model that transformation.
  const serialized = todos as unknown as SerializedTodo[];

  return (
    <ul>
      {serialized.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          allTodos={serialized}
          earliestStartDate={earliestStartDates[todo.id] ?? null}
          isOnCriticalPath={criticalPath.includes(todo.id)}
          currentDependencyIds={dependencyIdsMap[todo.id] ?? []}
        />
      ))}
    </ul>
  );
}
