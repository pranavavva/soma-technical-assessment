import { prisma } from "@/lib/prisma";
import TodoList from "@/components/TodoList";
import { AddTodoForm } from "@/components/AddTodoForm";

export default async function Home() {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col items-center bg-linear-to-b from-orange-500 to-red-500 p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-4xl font-bold text-white">Things To Do App</h1>
        <AddTodoForm />
        <TodoList todos={todos} />
      </div>
    </div>
  );
}
