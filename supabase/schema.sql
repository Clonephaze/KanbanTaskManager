-- =============================================================================
-- Kanban Task Manager — Supabase Schema
-- Run this in the Supabase SQL editor to set up your database.
-- =============================================================================

-- ── Tables ────────────────────────────────────────────────────────────────────

create table public.boards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  accent_color text,
  position     integer not null default 0,
  created_at   timestamptz default now()
);

create table public.columns (
  id        uuid primary key default gen_random_uuid(),
  board_id  uuid references public.boards(id) on delete cascade not null,
  name      text not null,
  wip_limit integer not null default 0,
  position  integer not null default 0
);

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  column_id   uuid references public.columns(id) on delete cascade not null,
  title       text not null,
  description text not null default '',
  priority    text check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date    date,
  position    integer not null default 0
);

create table public.subtasks (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid references public.tasks(id) on delete cascade not null,
  title        text not null,
  is_completed boolean not null default false,
  position     integer not null default 0
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index boards_user_id_idx   on public.boards(user_id);
create index columns_board_id_idx on public.columns(board_id);
create index tasks_column_id_idx  on public.tasks(column_id);
create index subtasks_task_id_idx on public.subtasks(task_id);

-- ── Row-level security ────────────────────────────────────────────────────────

alter table public.boards   enable row level security;
alter table public.columns  enable row level security;
alter table public.tasks    enable row level security;
alter table public.subtasks enable row level security;

-- Boards: full access for owner
create policy "boards: owner full access"
  on public.boards for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Columns: access via parent board ownership
create policy "columns: owner full access"
  on public.columns for all
  using  (exists (select 1 from public.boards b where b.id = columns.board_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.boards b where b.id = columns.board_id and b.user_id = auth.uid()));

-- Tasks: access via parent column → board ownership
create policy "tasks: owner full access"
  on public.tasks for all
  using  (exists (select 1 from public.columns c join public.boards b on b.id = c.board_id where c.id = tasks.column_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.columns c join public.boards b on b.id = c.board_id where c.id = tasks.column_id and b.user_id = auth.uid()));

-- Subtasks: access via parent task → column → board ownership
create policy "subtasks: owner full access"
  on public.subtasks for all
  using  (exists (select 1 from public.tasks t join public.columns c on c.id = t.column_id join public.boards b on b.id = c.board_id where t.id = subtasks.task_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.tasks t join public.columns c on c.id = t.column_id join public.boards b on b.id = c.board_id where t.id = subtasks.task_id and b.user_id = auth.uid()));
