create table if not exists recipe (
  restaurant_id uuid not null references restaurant(id) on delete cascade,
  id text not null,
  name text not null,
  category text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (restaurant_id, id)
);

create table if not exists recipe_ingredient (
  restaurant_id uuid not null,
  recipe_id text not null,
  position integer not null,
  name text not null,
  qty_per_serving numeric not null check (qty_per_serving >= 0),
  unit text not null,
  primary key (restaurant_id, recipe_id, position),
  foreign key (restaurant_id, recipe_id) references recipe(restaurant_id, id) on delete cascade
);

create table if not exists planned_event (
  restaurant_id uuid not null references restaurant(id) on delete cascade,
  id text not null,
  name text not null,
  event_date date not null,
  guests integer not null check (guests >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (restaurant_id, id)
);

create table if not exists event_recipe (
  restaurant_id uuid not null,
  event_id text not null,
  recipe_id text not null,
  servings integer not null check (servings >= 0),
  primary key (restaurant_id, event_id, recipe_id),
  foreign key (restaurant_id, event_id) references planned_event(restaurant_id, id) on delete cascade,
  foreign key (restaurant_id, recipe_id) references recipe(restaurant_id, id) on delete cascade
);

create index if not exists planned_event_restaurant_date_idx
  on planned_event (restaurant_id, event_date);
