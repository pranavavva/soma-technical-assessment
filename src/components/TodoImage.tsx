"use client";

import { Todo } from "@/generated/prisma/browser";
import Image from "next/image";
import { useState } from "react";

export type TodoImageProps = {
  todo: Todo;
};

export function TodoImage(props: TodoImageProps) {
  const {
    todo: { title, imageUrl },
  } = props;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return <Image src={imageUrl} alt={title} />;
}
