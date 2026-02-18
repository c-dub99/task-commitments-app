export type TaskSource = "Manual" | "Slack" | "Granola";
export type TaskStatus = "open" | "done";
export type Priority = "high" | "medium" | "low";

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface TaskCategoryRef {
  id: string;
  name: string;
  sort_order?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  source: TaskSource;
  source_ref: string | null;
  category_id: string | null;
  priority: Priority;
  sort_order: number;
  status: TaskStatus;
  created_at: string;
  completed_at: string | null;
  due_date: string | null;
  planned_date: string | null;
  raw_snippet: string | null;
  category?: TaskCategoryRef | null;
}

export type TaskInsert = Omit<Task, "id" | "created_at" | "completed_at"> & {
  id?: string;
  created_at?: string;
  completed_at?: string | null;
};

export type TaskUpdate = Partial<Pick<Task, "title" | "description" | "category_id" | "priority" | "sort_order" | "status" | "completed_at" | "due_date" | "planned_date">>;
