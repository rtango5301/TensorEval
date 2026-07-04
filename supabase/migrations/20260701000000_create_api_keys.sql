-- Migration: API keys for TensorEval SDK authentication
-- Stores only SHA-256 hashes. Plaintext keys are generated client-side and
-- shown once to the user.

create extension if not exists pgcrypto;

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_api_keys_user_id
  on public.api_keys(user_id);

create index if not exists idx_api_keys_key_hash
  on public.api_keys(key_hash);

alter table public.api_keys enable row level security;

drop policy if exists "Users can read own api keys" on public.api_keys;
create policy "Users can read own api keys"
  on public.api_keys
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own api keys" on public.api_keys;
create policy "Users can create own api keys"
  on public.api_keys
  for insert
  with check (auth.uid() = user_id);
