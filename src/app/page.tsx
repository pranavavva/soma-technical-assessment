import { prisma } from "@/lib/prisma";
import TodoList from "@/components/TodoList";
import { AddTodoForm } from "@/components/AddTodoForm";
import DependencyGraph from "@/components/DependencyGraph";
import { buildAdjacencyList, todoId, type TodoNode } from "@/lib/graph/types";
import { calculateEarliestStartDates, getCriticalPath } from "@/lib/graph/critical-path";

export default async function Home() {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      dependencies: { select: { dependencyId: true } },
      dependents: { select: { dependentId: true } },
    },
  });

  const relationships = await prisma.todoRelationship.findMany({
    select: { dependentId: true, dependencyId: true },
  });

  const graph = buildAdjacencyList(relationships);

  const todoNodes: TodoNode[] = todos.map((t) => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate,
    dependencyIds: t.dependencies.map((d) => todoId(d.dependencyId)),
    dependentIds: t.dependents.map((d) => todoId(d.dependentId)),
  }));

  const earliestStartDates = calculateEarliestStartDates(todoNodes, graph);
  const criticalPath = getCriticalPath(todoNodes, graph);

  // Serialize for client components
  const earliestStartDatesObj: Record<number, string | null> = {};
  earliestStartDates.forEach((date, id) => {
    earliestStartDatesObj[id] = date?.toISOString() ?? null;
  });

  const dependencyIdsMap: Record<number, number[]> = {};
  todos.forEach((t) => {
    dependencyIdsMap[t.id] = t.dependencies.map((d) => d.dependencyId);
  });

  return (
    <div className="flex min-h-screen flex-col items-center bg-linear-to-b from-orange-500 to-red-500 p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-4xl font-bold text-white">Things To Do App</h1>
        <AddTodoForm />
        <TodoList
          todos={todos}
          earliestStartDates={earliestStartDatesObj}
          criticalPath={criticalPath}
          dependencyIdsMap={dependencyIdsMap}
        />
        <DependencyGraph todos={todos} relationships={relationships} criticalPath={criticalPath} />
      </div>
    </div>
  );
}
