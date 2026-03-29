"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type TodoImageProps = {
  imageUrl: string | null;
  alt: string;
};

export default function TodoImage({ imageUrl, alt }: TodoImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!imageUrl || error) return null;

  return (
    <div className="relative w-full">
      {loading && <div className="h-32 w-full animate-pulse rounded-t-lg bg-gray-200" />}
      <Image
        src={imageUrl}
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        className={cn("h-auto w-full rounded-t-lg object-cover", loading && "hidden")}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}
