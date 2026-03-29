"use client";
import { Todo } from "@/generated/prisma/browser";
import { useState, useEffect } from "react";

export default function Home() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodo }),
      });
      setNewTodo("");
      fetchTodos();
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const handleDeleteTodo = async (id: any) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
      fetchTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-orange-500 to-red-500 p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-4xl font-bold text-white">Things To Do App</h1>
        <div className="mb-6 flex">
          <input
            type="text"
            className="flex-grow rounded-l-full p-3 text-gray-700 focus:outline-none"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <input type="date" />
          <button
            onClick={handleAddTodo}
            className="rounded-r-full bg-white p-3 text-indigo-600 transition duration-300 hover:bg-gray-100"
          >
            Add
          </button>
        </div>
        <ul>
          {todos.map((todo: Todo) => (
            <li
              key={todo.id}
              className="bg-opacity-90 mb-4 flex items-center justify-between rounded-lg bg-white p-4 shadow-lg"
            >
              <span className="text-gray-800">{todo.title}</span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500 transition duration-300 hover:text-red-700"
              >
                {/* Delete Icon */}
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
