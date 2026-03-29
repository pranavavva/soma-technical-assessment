"use client";

import { deleteTodo } from "@/app/actions/todo";
import DueDateBadge from "@/components/DueDateBadge";
import DependencySelector from "@/components/DependencySelector";
import TodoImage from "@/components/TodoImage";
import type { SerializedTodo } from "@/components/TodoList";
import { cn } from "@/lib/utils";

export type TodoItemProps = {
  todo: SerializedTodo;
  allTodos: SerializedTodo[];
  earliestStartDate: string | null;
  isOnCriticalPath: boolean;
  currentDependencyIds: number[];
};

export default function TodoItem({
  todo,
  allTodos,
  earliestStartDate,
  isOnCriticalPath,
  currentDependencyIds,
}: TodoItemProps) {
  return (
    <li
      className={cn(
        "bg-opacity-90 mb-4 overflow-hidden rounded-lg bg-white shadow-lg",
        isOnCriticalPath && "ring-2 ring-red-400",
      )}
    >
      <TodoImage imageUrl={todo.imageUrl} alt={todo.title} />
      <div className="flex items-center justify-between p-4">
        <div className="flex flex-col gap-1">
          <span className="text-gray-800">{todo.title}</span>
          <DueDateBadge dueDate={todo.dueDate} />
          {earliestStartDate && (
            <span className="text-xs text-blue-500">
              Earliest start: {new Date(earliestStartDate).toLocaleDateString()}
            </span>
          )}
          <DependencySelector todoId={todo.id} allTodos={allTodos} currentDependencyIds={currentDependencyIds} />
        </div>
        <button onClick={() => deleteTodo(todo.id)} className="text-red-500 transition duration-300 hover:text-red-700">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </li>
  );
}
