import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/tasks/data-table";
import { columns, type TaskRow } from "@/components/tasks/columns";
import { DependencyFlowGraph } from "@/components/tasks/dependency-flow-graph";
import { TasksTabs } from "@/components/tasks/tasks-tabs";
import { buildAdjacencyList, todoId, type TodoNode } from "@/lib/graph/types";
import { calculateEarliestStartDates, getCriticalPath } from "@/lib/graph/critical-path";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

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

  // Build lookup for dependency titles
  const todoById = new Map(todos.map((t) => [t.id, t]));

  const taskRows: TaskRow[] = todos.map((t) => {
    const depIds = t.dependencies.map((d) => d.dependencyId);
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      dueDate: t.dueDate ?? null,
      imageUrl: t.imageUrl,
      dependencyIds: depIds,
      dependencyTitles: depIds.map((id) => todoById.get(id)?.title ?? "Unknown"),
      earliestStartDate: earliestStartDates.get(todoId(t.id))?.toISOString() ?? null,
      isOnCriticalPath: criticalPath.includes(todoId(t.id)),
    };
  });

  const todosForGraph = todos.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
  }));

  return (
    <NuqsAdapter>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your tasks and dependencies.</p>
        </header>

        <Suspense>
          <TasksTabs
            tasksContent={<DataTable columns={columns} data={taskRows} />}
            dependenciesContent={
              <DependencyFlowGraph todos={todosForGraph} relationships={relationships} criticalPath={criticalPath} />
            }
          />
        </Suspense>
      </main>
    </NuqsAdapter>
  );
}
