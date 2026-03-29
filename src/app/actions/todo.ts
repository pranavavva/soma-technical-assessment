"use server";

import { searchImage } from "@/lib/pexels";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;
  const dueDate = formData.get("dueDate") as string;

  if (!title?.trim()) return;

  const { id } = await prisma.todo.create({
    data: {
      title,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  const imageUrl = await searchImage(title);

  await prisma.todo.update({
    data: { imageUrl },
    where: { id },
  });

  revalidatePath("/");
}

export async function deleteTodo(id: number) {
  await prisma.todo.delete({ where: { id } });
  revalidatePath("/");
}
