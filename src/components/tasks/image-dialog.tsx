"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import Image from "next/image";

type ImageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt: string;
};

export function ImageDialog({ open, onOpenChange, imageUrl, alt }: ImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-2">
        <VisuallyHidden.Root>
          <DialogTitle>{alt}</DialogTitle>
        </VisuallyHidden.Root>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image src={imageUrl} alt={alt} fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
