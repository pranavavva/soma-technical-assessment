import { useRef, useState } from "react";
import { addTodo } from "@/app/actions/todo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";

type InlineAddRowProps = {
  onClose: () => void;
  colSpan: number;
};

export function InlineAddRow({ onClose, colSpan }: InlineAddRowProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("title", title.trim());
    if (dueDate) formData.set("dueDate", dueDate);

    await addTodo(formData);
    setTitle("");
    setDueDate("");
    setIsSubmitting(false);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") onClose();
  }

  return (
    <TableRow className="bg-muted/30">
      <TableCell colSpan={colSpan}>
        <div className="flex items-center gap-3">
          <Input
            ref={inputRef}
            placeholder="New task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 flex-1"
            autoFocus
            disabled={isSubmitting}
          />
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-40"
            disabled={isSubmitting}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-green-500"
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
