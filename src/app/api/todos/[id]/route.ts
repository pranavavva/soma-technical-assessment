import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    await prisma.todo.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Todo deleted" }, { status: 200 });
    // TODO: error handling
  } catch {
    return NextResponse.json({ error: "Error deleting todo" }, { status: 500 });
  }
}
