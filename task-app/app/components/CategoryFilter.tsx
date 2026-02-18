"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

export function CategoryFilter({
  categories,
  currentCategoryId,
}: {
  categories: Category[];
  currentCategoryId: string | undefined;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "" || value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Category:
      </span>
      <select
        value={currentCategoryId ?? "all"}
        onChange={handleChange}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        aria-label="Filter by category"
      >
        <option value="all">All categories</option>
        <option value="none">Uncategorised</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
