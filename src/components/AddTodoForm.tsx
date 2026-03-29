"use client";

import { addTodo } from "@/app/actions/todo";
import { useRef } from "react";

export function AddTodoForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const formAction = async (formData: FormData) => {
    await addTodo(formData);
    formRef.current?.reset();
  };

  return (
    <form ref={formRef} action={formAction} className="mb-6 flex">
      <input
        name="title"
        type="text"
        className="rounded-1-full grow p-3 text-gray-700 focus:outline-none"
        placeholder="Add a new todo"
      />
      <input name="dueDate" type="date" className="border-y border-gray-200 p-3 text-gray-700 focus:outline-none" />
      <button
        type="submit"
        className="rounded-r-full bg-white p-3 text-indigo-600 transition duration-300 hover:bg-gray-700"
      >
        Add
      </button>
    </form>
  );
}
