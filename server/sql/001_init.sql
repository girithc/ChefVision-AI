create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists restaurant (
  id uuid primary key,
  name text not null
);

create table if not exists app_user (
  id uuid primary key,
  restaurant_id uuid not null references restaurant(id),
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'owner'))
);

create table if not exists ingredient_canonical (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null unique,
  default_unit text not null,
  embedding vector(384),
  is_active boolean not null default true
);

create table if not exists ingredient_alias (
  id uuid primary key default gen_random_uuid(),
  canonical_id uuid not null references ingredient_canonical(id),
  alias_text text not null,
  vendor_id text,
  unique (alias_text, vendor_id)
);

create table if not exists invoice (
  id uuid primary key,
  restaurant_id uuid not null references restaurant(id),
  storage_key text not null,
  original_filename text not null,
  mime_type text not null,
  supplier_name text,
  invoice_date date,
  status text not null check (status in ('pending', 'processing', 'done', 'error')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoice_line_item (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoice(id) on delete cascade,
  raw_name text not null,
  raw_qty numeric not null,
  raw_unit text not null,
  canonical_id uuid,
  canonical_name text,
  normalized_qty numeric,
  normalized_unit text,
  confidence numeric,
  routing text
);

create table if not exists normalization_match (
  line_item_id uuid primary key references invoice_line_item(id) on delete cascade,
  canonical_id uuid,
  confidence numeric,
  routing text not null,
  is_confirmed boolean not null default false
);

create table if not exists inventory_ledger (
  restaurant_id uuid not null references restaurant(id),
  canonical_id uuid not null,
  canonical_name text not null,
  on_hand_qty numeric not null default 0,
  unit text not null,
  updated_at timestamptz not null default now(),
  primary key (restaurant_id, canonical_id)
);

create index if not exists ingredient_canonical_embedding_idx
  on ingredient_canonical
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);

insert into restaurant (id, name)
values ('11111111-1111-1111-1111-111111111111', 'ChefVision Demo Restaurant')
on conflict (id) do nothing;

insert into app_user (id, restaurant_id, email, password_hash, role)
values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'owner@chefvision.test', 'secret', 'owner'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'admin@chefvision.test', 'secret', 'admin')
on conflict (email) do nothing;

insert into ingredient_canonical (id, canonical_name, default_unit, embedding, is_active)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tomato', 'kg', null, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Chicken Breast', 'kg', null, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Olive Oil', 'l', null, true)
on conflict (id) do nothing;

insert into ingredient_alias (canonical_id, alias_text, vendor_id)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tomato roma', null),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'roma tomato', null),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'extra virgin olive oil', null)
on conflict (alias_text, vendor_id) do nothing;
