-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor) after creating a project.
-- Phase 1: tasks and categories for manual entry only.

-- Categories (user-defined, e.g. "Meeting follow-up", "Slack", "Idea")
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Tasks (unified model from PRD)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  source text not null default 'Manual' check (source in ('Manual', 'Slack', 'Granola')),
  source_ref text,
  category_id uuid references public.categories(id) on delete set null,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  sort_order int not null default 0,
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  due_date date,
  planned_date date,
  raw_snippet text
);

-- Indexes for common filters
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_planned_date on public.tasks(planned_date);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_tasks_created_at on public.tasks(created_at desc);

-- Enable RLS (Row Level Security) but allow all for single-user Phase 1
-- You can tighten this when adding auth later.
alter table public.categories enable row level security;
alter table public.tasks enable row level security;

create policy "Allow all for categories" on public.categories for all using (true) with check (true);
create policy "Allow all for tasks" on public.tasks for all using (true) with check (true);
