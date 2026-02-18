"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function createCategory(name: string): Promise<Category> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, sort_order: 0 })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  return data as Category;
}

export async function createCategoryFromForm(formData: FormData): Promise<void> {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;
  await createCategory(name);
}

export async function ensureDefaultCategory(): Promise<Category | null> {
  const categories = await getCategories();
  if (categories.length > 0) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: "Uncategorised", sort_order: 0 })
    .select()
    .single();
  if (error) return null;
  revalidatePath("/");
  return data as Category;
}
