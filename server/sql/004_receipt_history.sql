alter table invoice
  add column if not exists external_receipt_id text,
  add column if not exists source text not null default 'scan' check (source in ('scan', 'manual')),
  add column if not exists invoice_number text,
  add column if not exists tax numeric not null default 0,
  add column if not exists tip numeric not null default 0,
  add column if not exists notes text not null default '';

alter table invoice_line_item
  add column if not exists unit_price numeric not null default 0;

create unique index if not exists invoice_restaurant_external_receipt_idx
  on invoice (restaurant_id, external_receipt_id)
  where external_receipt_id is not null;

create index if not exists invoice_restaurant_created_idx
  on invoice (restaurant_id, created_at desc);
