import Link from "next/link";
import { Suspense } from "react";
import { getCategories, ensureDefaultCategory, createCategoryFromForm } from "./actions/categories";
import { getTasks, createTaskFromForm } from "./actions/tasks";
import { CategoryFilter } from "./components/CategoryFilter";
import { TaskRow } from "./components/TaskRow";
import type { Task } from "@/lib/types";

function buildQueryString({
  view,
  status,
  category,
}: {
  view: string;
  status: string;
  category?: string | null;
}) {
  const params = new URLSearchParams();
  if (view !== "all") params.set("view", view);
  if (status !== "open") params.set("status", status);
  if (category && category !== "all") params.set("category", category);
  const q = params.toString();
  return q ? `?${q}` : "/";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; status?: string; category?: string }>;
}) {
  const params = await searchParams;
  const view = (params.view as "today" | "tomorrow" | "week" | "someday" | "all") ?? "all";
  const statusFilter = (params.status as "open" | "done") ?? "open";
  const categoryParam = params.category;

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let tasks: Task[] = [];
  let error: string | null = null;

  const categoryIdForQuery =
    categoryParam === "none" ? "" : categoryParam && categoryParam !== "all" ? categoryParam : undefined;

  try {
    await ensureDefaultCategory();
    categories = await getCategories();
    tasks = await getTasks({ status: statusFilter, view, category_id: categoryIdForQuery });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load. Is Supabase configured?";
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Task commitments
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            One place for commitments from meetings, Slack, and ideas.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            {error}
            <p className="mt-2">
              Copy <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local.example</code> to{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> and run{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">supabase/schema.sql</code> in your
              Supabase SQL Editor.
            </p>
          </div>
        )}

        {/* View, status, and category filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2 gap-y-3">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">View:</span>
          {(["all", "today", "tomorrow", "week", "someday"] as const).map((v) => (
            <Link
              key={v}
              href={buildQueryString({ view: v, status: statusFilter, category: categoryParam })}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                view === v
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              }`}
            >
              {v === "all" ? "All" : v === "today" ? "Today" : v === "tomorrow" ? "Tomorrow" : v === "week" ? "This week" : "Some day"}
            </Link>
          ))}
          <span className="ml-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Status:</span>
          {(["open", "done"] as const).map((s) => (
            <Link
              key={s}
              href={buildQueryString({ view, status: s, category: categoryParam })}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === s
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              }`}
            >
              {s === "open" ? "Open" : "Done"}
            </Link>
          ))}
          <span className="ml-2 shrink-0">
            <Suspense fallback={<span className="text-sm text-zinc-400">Category:</span>}>
              <CategoryFilter categories={categories} currentCategoryId={categoryParam} />
            </Suspense>
          </span>
        </div>

        {/* Add task panel — form + New category under Optional row */}
        {!error && (
          <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Add task
            </h2>
            <form action={createTaskFromForm}>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    placeholder="What did you commit to? (press Enter to add)"
                    required
                    autoFocus
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 pr-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                  />
                  <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                    Press Enter to add. You can set category and priority below or edit them later.
                  </p>
                </div>
                <details className="text-sm text-zinc-600 dark:text-zinc-400">
                  <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                    Optional: category, priority, date
                  </summary>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <select
                      name="category_id"
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="">Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="priority"
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="low">Low</option>
                    </select>
                    <input
                      type="date"
                      name="planned_date"
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Add
                    </button>
                  </div>
                </details>
              </div>
            </form>
            <details className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
              <summary className="cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-300">
                New category
              </summary>
              <form action={createCategoryFromForm} className="mt-2 flex gap-2">
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Meeting follow-up"
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Add category
                </button>
              </form>
            </details>
          </div>
        )}

        {/* Task list */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {statusFilter === "open" ? "Open" : "Done"} tasks
            {view !== "all" && ` (${view})`}
          </h2>
          {tasks.length === 0 && !error && (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-white py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              No tasks yet. Add one above or run a scan (Phase 2).
            </p>
          )}
          <ul className="space-y-2">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} categories={categories} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
