"use client";

import { useMemo, useState, useTransition } from "react";
import { addDependency, removeDependency } from "@/app/actions/dependency";
import { buildAdjacencyList, todoId as toTodoId } from "@/lib/graph/types";
import { wouldCreateCycle } from "@/lib/graph/cycle-detection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, X, Ban } from "lucide-react";

type SerializedTodo = {
  id: number;
  title: string;
  dueDate: string | null;
  dependencyIds?: number[];
  [key: string]: unknown;
};

type DependencySelectorProps = {
  todoId: number;
  allTodos: SerializedTodo[];
  currentDependencyIds: number[];
};

type CandidateItemProps = {
  todo: SerializedTodo;
  isExisting: boolean;
  isCyclic: boolean;
  onAdd: (id: number) => void;
};

function CandidateItem({ todo, isExisting, isCyclic, onAdd }: CandidateItemProps) {
  const isDisabled = isExisting || isCyclic;
  const getReason = () => {
    if (isExisting) return "Already a dependency";
    if (isCyclic) return "Would create circular dependency";
    return null;
  };
  const reason = getReason();

  return (
    <CommandItem
      onSelect={() => !isDisabled && onAdd(todo.id)}
      disabled={isDisabled}
      className={isDisabled ? "opacity-50" : ""}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1">
          {isDisabled && <Ban className="text-muted-foreground h-3 w-3 shrink-0" />}
          <span className="truncate">{todo.title}</span>
          {!isDisabled && todo.dueDate && (
            <span className="text-muted-foreground ml-auto shrink-0 text-xs">
              {new Date(todo.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {reason && <span className="text-muted-foreground text-[10px]">{reason}</span>}
      </div>
    </CommandItem>
  );
}

export default function DependencySelector({ todoId, allTodos, currentDependencyIds }: DependencySelectorProps) {
  const [depIds, setDepIds] = useState<number[]>(currentDependencyIds);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const dependencyTodos = allTodos.filter((t) => depIds.includes(t.id));
  const candidateTodos = allTodos.filter((t) => t.id !== todoId);

  // Build adjacency list from current state to check for cycles client-side
  const cycleSet = useMemo(() => {
    const relationships: { dependentId: number; dependencyId: number }[] = [];
    allTodos.forEach((t) => {
      const effectiveDeps = t.id === todoId ? depIds : (t.dependencyIds ?? []);
      effectiveDeps.forEach((depId) => {
        relationships.push({ dependentId: t.id, dependencyId: depId });
      });
    });

    const graph = buildAdjacencyList(relationships);
    const wouldCycle = new Set<number>();

    candidateTodos.forEach((t) => {
      if (!depIds.includes(t.id) && wouldCreateCycle(graph, toTodoId(todoId), toTodoId(t.id))) {
        wouldCycle.add(t.id);
      }
    });

    return wouldCycle;
  }, [allTodos, depIds, todoId, candidateTodos]);

  function handleAdd(dependencyId: number) {
    setError(null);
    setDepIds((prev) => [...prev, dependencyId]);
    setOpen(false);

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
    <div className="mt-2">
      {dependencyTodos.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {dependencyTodos.map((dep) => (
            <Badge key={dep.id} variant="secondary" className="gap-1 pr-1 text-[10px]">
              {dep.title}
              <button
                type="button"
                onClick={() => handleRemove(dep.id)}
                disabled={isPending}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 disabled:opacity-50"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {candidateTodos.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground h-7 px-2 text-xs" disabled={isPending}>
              <Plus className="mr-1 h-3 w-3" />
              Blocked by...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tasks..." />
              <CommandList>
                <CommandEmpty>No tasks found.</CommandEmpty>
                {candidateTodos.map((t) => (
                  <CandidateItem
                    key={t.id}
                    todo={t}
                    isExisting={depIds.includes(t.id)}
                    isCyclic={cycleSet.has(t.id)}
                    onAdd={handleAdd}
                  />
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
    </div>
  );
}
