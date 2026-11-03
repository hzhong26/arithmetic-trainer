-- Run this once in Supabase: dashboard → SQL Editor → New query → paste → Run.
-- It creates the table for game records and the rules that keep
-- each person's games private to them.

create table public.games (
    id bigint generated always as identity primary key,
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    played_at timestamptz not null default now(),
    label text not null,
    duration int not null,
    score int not null,
    stats jsonb not null default '{}'
);

create index games_user_id_idx on public.games (user_id);

-- Row level security: without a matching rule, nobody can read or change anything
alter table public.games enable row level security;

create policy "Users can read their own games"
    on public.games for select to authenticated
    using (auth.uid() = user_id);

create policy "Users can add their own games"
    on public.games for insert to authenticated
    with check (auth.uid() = user_id);

create policy "Users can delete their own games"
    on public.games for delete to authenticated
    using (auth.uid() = user_id);
