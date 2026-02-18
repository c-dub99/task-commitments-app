# Task Commitments App – Setup

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the dashboard, go to **SQL Editor** and run the contents of **`supabase/schema.sql`** (creates `categories` and `tasks` tables).
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Environment

Copy the example env file and fill in your Supabase values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the task list, add-task form, and add-category form. If Supabase is not configured, the page will show a short setup message.
