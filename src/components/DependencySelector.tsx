"use client";

import { useState, useTransition } from "react";
import { addDependency, removeDependency } from "@/app/actions/dependency";
import { SerializedTodo } from "@/components/TodoList";

type DependencySelectorProps = {
  todoId: number;
  allTodos: SerializedTodo[];
  currentDependencyIds: number[];
};

export default function DependencySelector({ todoId, allTodos, currentDependencyIds }: DependencySelectorProps) {
  const [depIds, setDepIds] = useState<number[]>(currentDependencyIds);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dependencyTodos = allTodos.filter((t) => depIds.includes(t.id));
  const availableTodos = allTodos.filter((t) => t.id !== todoId && !depIds.includes(t.id));

  function handleAdd(dependencyId: number) {
    setError(null);
    setDepIds((prev) => [...prev, dependencyId]);

    startTransition(async () => {
      const result = await addDependency(todoId, dependencyId);
      if (!result.success) {
        setDepIds((prev) => prev.filter((id) => id !== dependencyId));
        setError(result.error ?? "Failed to add dependency");
      }
    });
  }

  function handleRemove(dependencyId: number) {
    setError(null);
    setDepIds((prev) => prev.filter((id) => id !== dependencyId));

    startTransition(async () => {
      await removeDependency(todoId, dependencyId);
    });
  }

  return (
    <div className="mt-1">
      <div className="flex flex-wrap gap-1">
        {dependencyTodos.map((dep) => (
          <span
            key={dep.id}
            className="inline-flex items-center gap-0.5 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700"
          >
            {dep.title}
            <button
              type="button"
              onClick={() => handleRemove(dep.id)}
              disabled={isPending}
              className="ml-0.5 text-gray-500 hover:text-gray-800 disabled:opacity-50"
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      {availableTodos.length > 0 && (
        <select
          className="mt-1 w-full rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-700 disabled:opacity-50"
          value=""
          disabled={isPending}
          onChange={(e) => {
            const id = Number(e.target.value);
            if (id) handleAdd(id);
          }}
        >
          <option value="">Add dependency...</option>
          {availableTodos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
