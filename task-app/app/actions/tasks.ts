"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { Task, TaskInsert, TaskUpdate } from "@/lib/types";

function rowToTask(row: Record<string, unknown>, category?: { id: string; name: string; sort_order?: number } | null): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    source: (row.source as Task["source"]) ?? "Manual",
    source_ref: (row.source_ref as string) ?? null,
    category_id: (row.category_id as string) ?? null,
    priority: (row.priority as Task["priority"]) ?? "medium",
    sort_order: (row.sort_order as number) ?? 0,
    status: (row.status as Task["status"]) ?? "open",
    created_at: row.created_at as string,
    completed_at: (row.completed_at as string) ?? null,
    due_date: (row.due_date as string) ?? null,
    planned_date: (row.planned_date as string) ?? null,
    raw_snippet: (row.raw_snippet as string) ?? null,
    category: category ?? null,
  };
}

export async function getTasks(filters?: {
  status?: "open" | "done";
  view?: "today" | "tomorrow" | "week" | "someday" | "all";
  category_id?: string | null;
}): Promise<Task[]> {
  const supabase = createServerClient();
  let query = supabase
    .from("tasks")
    .select("*, category:categories(id, name)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.category_id !== undefined && filters?.category_id !== null && filters?.category_id !== "") {
    query = query.eq("category_id", filters.category_id);
  } else if (filters?.category_id === "") {
    query = query.is("category_id", null);
  }

  const { data, error } = await query;
  if (error) throw error;

  const tasks = (data ?? []).map((row: Record<string, unknown>) => {
    const cat = row.category ?? row.categories;
    return rowToTask(row, (cat as { id: string; name: string } | null) ?? null);
  });

  if (filters?.view === "today" || filters?.view === "tomorrow" || filters?.view === "week" || filters?.view === "someday") {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    return tasks.filter((t) => {
      const planned = t.planned_date ?? t.due_date;
      if (filters.view === "someday") {
        return !planned || planned > weekEndStr;
      }
      if (!planned) return false;
      if (filters.view === "today") return planned === today;
      if (filters.view === "tomorrow") return planned === tomorrowStr;
      return planned >= today && planned <= weekEndStr;
    });
  }

  return tasks;
}

export async function createTaskFromForm(formData: FormData): Promise<void> {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return;
  await createTask({
    title,
    description: (formData.get("description") as string) || null,
    category_id: (formData.get("category_id") as string) || null,
    priority: (formData.get("priority") as Task["priority"]) || "medium",
    due_date: (formData.get("due_date") as string) || null,
    planned_date: (formData.get("planned_date") as string) || null,
  });
}

export async function createTask(input: {
  title: string;
  description?: string | null;
  category_id?: string | null;
  priority?: Task["priority"];
  due_date?: string | null;
  planned_date?: string | null;
}): Promise<Task> {
  const supabase = createServerClient();
  const insert: TaskInsert = {
    title: input.title,
    description: input.description ?? null,
    source: "Manual",
    source_ref: null,
    category_id: input.category_id ?? null,
    priority: input.priority ?? "medium",
    sort_order: 0,
    status: "open",
    due_date: input.due_date ?? null,
    planned_date: input.planned_date ?? null,
    raw_snippet: null,
  };
  const { data, error } = await supabase.from("tasks").insert(insert).select("*, category:categories(id, name)").single();
  if (error) throw error;
  revalidatePath("/");
  const row = data as Record<string, unknown>;
  return rowToTask(row, (row.category ?? row.categories) as { id: string; name: string } | null);
}

export async function updateTask(id: string, updates: TaskUpdate): Promise<Task> {
  const supabase = createServerClient();
  if (updates.status === "done") {
    (updates as Record<string, unknown>).completed_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select("*, category:categories(id, name)")
    .single();
  if (error) throw error;
  revalidatePath("/");
  const row = data as Record<string, unknown>;
  return rowToTask(row, (row.category ?? row.categories) as { id: string; name: string } | null);
}

export async function completeTask(id: string): Promise<void> {
  await updateTask(id, { status: "done" });
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}

export async function deleteTaskAction(id: string): Promise<void> {
  await deleteTask(id);
}

export async function updateTaskCategoryPriority(
  taskId: string,
  categoryId: string | null,
  priority: Task["priority"]
): Promise<void> {
  await updateTask(taskId, { category_id: categoryId, priority });
}

export async function updateTaskPlannedDate(
  taskId: string,
  plannedDate: string | null
): Promise<void> {
  await updateTask(taskId, { planned_date: plannedDate });
}
