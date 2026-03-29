"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, ChevronDown, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  onAddTask: () => void;
  isAdding: boolean;
};

const statuses = [
  { value: "todo", label: "Todo" },
  { value: "in progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export function DataTableToolbar<TData>({ table, onAddTask, isAdding }: DataTableToolbarProps<TData>) {
  const statusColumn = table.getColumn("status");
  const filterValue = (statusColumn?.getFilterValue() as string[]) ?? [];

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Filter tasks..."
        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
        onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
        className="h-8 w-[150px] lg:w-[250px]"
      />

      {/* Status faceted filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            Status
            {filterValue.length > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                  {filterValue.length}
                </Badge>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              {statuses.map((status) => {
                const isSelected = filterValue.includes(status.value);
                return (
                  <CommandItem
                    key={status.value}
                    onSelect={() => {
                      const next = isSelected
                        ? filterValue.filter((v) => v !== status.value)
                        : [...filterValue, status.value];
                      statusColumn?.setFilterValue(next.length > 0 ? next : undefined);
                    }}
                  >
                    <div
                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${isSelected ? "bg-primary border-primary text-primary-foreground" : "opacity-50"}`}
                    >
                      {isSelected && <span className="text-xs">✓</span>}
                    </div>
                    {status.label}
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {filterValue.length > 0 && (
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => statusColumn?.setFilterValue(undefined)}>
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" className="h-8" onClick={onAddTask} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
}
