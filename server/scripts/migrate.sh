#!/bin/sh
set -eu

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  "create table if not exists schema_migration (filename text primary key, applied_at timestamptz not null default now())"

for migration in /migrations/*.sql; do
  filename="$(basename "$migration")"
  applied="$(psql "$DATABASE_URL" -tAc "select 1 from schema_migration where filename = '$filename'")"
  if [ "$applied" = "1" ]; then
    echo "Skipping applied migration $filename"
    continue
  fi

  echo "Applying migration $filename"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
    "insert into schema_migration (filename) values ('$filename')"
done
