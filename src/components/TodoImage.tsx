"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type TodoImageProps = {
  imageUrl: string | null;
  alt: string;
  priority?: boolean;
};

export default function TodoImage({ imageUrl, alt, priority = false }: TodoImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!imageUrl || error) return null;

  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-t-xl">
      {loading && <div className="bg-muted absolute inset-0 animate-pulse" />}
      <Image
        src={imageUrl}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        className={cn("object-cover", loading && "invisible")}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}
