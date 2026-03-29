"use client";

import { Todo } from "@/generated/prisma/browser";
import { deleteTodo } from "@/app/actions";

export type TodoListProps = {
  todos: Todo[];
};

export default function TodoList(props: TodoListProps) {
  const { todos } = props;

  return (
    <ul>
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="bg-opacity-90 mb-4 flex items-center justify-between rounded-lg bg-white p-4 shadow-lg"
        >
          <span className="text-gray-800">{todo.title}</span>
          <span className="text-gray-800">{todo.dueDate?.toLocaleString()}</span>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="text-red-500 transition duration-300 hover:text-red-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
