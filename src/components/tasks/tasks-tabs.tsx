"use client";

import { useQueryState } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TasksTabsProps = {
  tasksContent: React.ReactNode;
  dependenciesContent: React.ReactNode;
};

export function TasksTabs({ tasksContent, dependenciesContent }: TasksTabsProps) {
  const [tab, setTab] = useQueryState("tab", { defaultValue: "tasks" });

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
      </TabsList>

      <TabsContent value="tasks" className="mt-4">
        {tasksContent}
      </TabsContent>

      <TabsContent value="dependencies" className="mt-4">
        {dependenciesContent}
      </TabsContent>
    </Tabs>
  );
}
