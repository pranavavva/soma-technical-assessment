"use server";

import { prisma } from "@/lib/prisma";
import { buildAdjacencyList, todoId } from "@/lib/graph/types";
import { wouldCreateCycle } from "@/lib/graph/cycle-detection";
import { revalidatePath } from "next/cache";

export async function addDependency(
  dependentId: number,
  dependencyId: number,
): Promise<{ success: boolean; error?: string }> {
  if (dependentId === dependencyId) return { success: false, error: "A task cannot depend on itself" };

  const relationships = await prisma.todoRelationship.findMany({
    select: { dependentId: true, dependencyId: true },
  });

  const graph = buildAdjacencyList(relationships);

  if (wouldCreateCycle(graph, todoId(dependentId), todoId(dependencyId)))
    return {
      success: false,
      error: "Adding this dependency would create a circular dependency",
    };

  try {
    await prisma.todoRelationship.create({
      data: { dependentId, dependencyId },
    });
  } catch {
    return { success: false, error: "This dependency already exists" };
  }

  revalidatePath("/");
  return { success: true };
}

export async function removeDependency(dependentId: number, dependencyId: number) {
  await prisma.todoRelationship.deleteMany({
    where: { dependentId, dependencyId },
  });
  revalidatePath("/");
}
