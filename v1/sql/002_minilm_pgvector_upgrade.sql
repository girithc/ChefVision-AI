drop index if exists ingredient_canonical_embedding_idx;

alter table ingredient_canonical
  alter column embedding drop not null;

update ingredient_canonical
set embedding = null
where embedding is not null;

alter table ingredient_canonical
  alter column embedding type vector(384);

create index if not exists ingredient_canonical_embedding_idx
  on ingredient_canonical
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);
