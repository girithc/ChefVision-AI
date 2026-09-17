create table if not exists invoice_file (
  storage_key text primary key,
  content bytea not null,
  created_at timestamptz not null default now()
);
