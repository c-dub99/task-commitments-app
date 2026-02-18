"use client";

import { useTransition } from "react";
import { completeTask, deleteTaskAction, updateTaskCategoryPriority, updateTaskPlannedDate } from "@/app/actions/tasks";
import type { Task } from "@/lib/types";
import type { Category } from "@/lib/types";

const PRIORITY_STYLE: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300",
};

export function TaskRow({
  task,
  categories,
}: {
  task: Task;
  categories: Category[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value || null;
    startTransition(() =>
      updateTaskCategoryPriority(task.id, value, task.priority)
    );
  }

  function handlePriorityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as Task["priority"];
    startTransition(() =>
      updateTaskCategoryPriority(task.id, task.category_id, value)
    );
  }

  function handlePlannedDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value || null;
    startTransition(() => updateTaskPlannedDate(task.id, value));
  }

  return (
    <li
      className={`flex flex-wrap items-center gap-2 rounded-xl border bg-white px-4 py-3 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 ${
        task.status === "done" ? "opacity-75" : ""
      } ${isPending ? "opacity-60" : ""}`}
    >
      {task.status === "open" && (
        <form action={completeTask.bind(null, task.id)} className="flex-shrink-0">
          <button
            type="submit"
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Done
          </button>
        </form>
      )}
      <div className="min-w-0 flex-1">
        <span
          className={
            task.status === "done"
              ? "text-zinc-500 line-through dark:text-zinc-400"
              : "font-medium"
          }
        >
          {task.title}
        </span>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          <select
            value={task.category_id ?? ""}
            onChange={handleCategoryChange}
            disabled={task.status === "done"}
            className="rounded border border-zinc-200 bg-zinc-50 py-1 pr-6 text-zinc-700 focus:border-zinc-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 disabled:opacity-50"
            aria-label="Category"
          >
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={task.priority}
            onChange={handlePriorityChange}
            disabled={task.status === "done"}
            className={`rounded py-1 pr-6 font-medium focus:outline-none disabled:opacity-50 ${PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.medium}`}
            aria-label="Priority"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="date"
            value={task.planned_date ?? task.due_date ?? ""}
            onChange={handlePlannedDateChange}
            disabled={task.status === "done"}
            className="rounded border border-zinc-200 bg-zinc-50 py-1 px-2 text-zinc-700 focus:border-zinc-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 disabled:opacity-50"
            aria-label="Planned date"
          />
        </div>
      </div>
      <form action={deleteTaskAction.bind(null, task.id)} className="flex-shrink-0">
        <button
          type="submit"
          className="rounded border border-transparent px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          aria-label="Delete"
        >
          Delete
        </button>
      </form>
    </li>
  );
}
