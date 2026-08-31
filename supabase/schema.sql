-- AURA 3D product listing app — Supabase schema.
-- Idempotent: safe to re-run. Run this in the Supabase SQL editor
-- (Project → SQL Editor → New query) for project yiwxqytgyzpjcbbzsdtu.

create table if not exists public.user_product_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  list_type text not null check (list_type in ('wishlist', 'compare')),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, list_type)
);

alter table public.user_product_lists enable row level security;

drop policy if exists "Users manage their own list items" on public.user_product_lists;
create policy "Users manage their own list items"
  on public.user_product_lists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Avatar uploads (UserProfileDrawer). Public bucket so avatar URLs render
-- directly in <img>; uploads are still restricted to the owner via RLS,
-- keyed on the first path segment being the uploader's user id.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users upload their own avatar" on storage.objects;
create policy "Users upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and storage.foldername(name)[1] = auth.uid()::text);
