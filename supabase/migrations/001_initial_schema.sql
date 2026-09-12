-- TeyaCollections Database Schema
-- Supabase / PostgreSQL

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id              uuid primary key default uuid_generate_v4(),
  category_id     uuid references public.categories(id) on delete set null,
  name            text not null,
  slug            text not null unique,
  description     text,
  price           numeric(10,2) not null check (price >= 0),
  compare_price   numeric(10,2) check (compare_price >= 0),
  images          jsonb not null default '[]'::jsonb,  -- [{url, alt, isPrimary}]
  sizes           jsonb not null default '[]'::jsonb,  -- ["XS","S","M","L","XL"]
  colors          jsonb not null default '[]'::jsonb,  -- [{name, hex}]
  stock           int not null default 0 check (stock >= 0),
  is_featured     boolean not null default false,
  is_active       boolean not null default true,
  meta_title      text,
  meta_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- ADDRESSES (reusable for users)
-- ============================================================
create table public.addresses (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  phone        text not null,
  line1        text not null,
  line2        text,
  city         text not null,
  state        text not null,
  pincode      text not null,
  country      text not null default 'India',
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create type public.order_status as enum (
  'pending',
  'payment_initiated',
  'paid',
  'payment_failed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create table public.orders (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references auth.users(id) on delete set null,
  razorpay_order_id     text unique,
  razorpay_payment_id   text,
  razorpay_signature    text,
  status                public.order_status not null default 'pending',
  subtotal              numeric(10,2) not null check (subtotal >= 0),
  shipping_fee          numeric(10,2) not null default 0 check (shipping_fee >= 0),
  discount              numeric(10,2) not null default 0 check (discount >= 0),
  total                 numeric(10,2) not null check (total >= 0),
  shipping_address      jsonb not null,  -- snapshot at time of order
  payment_method        text,
  notes                 text,
  webhook_received_at   timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- ORDER ITEMS (normalized, with historical price snapshot)
-- ============================================================
create table public.order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,   -- snapshot
  product_image text,           -- snapshot (primary image url)
  size         text,
  color        text,
  quantity     int not null check (quantity > 0),
  unit_price   numeric(10,2) not null check (unit_price >= 0),  -- snapshot
  total        numeric(10,2) not null check (total >= 0),
  created_at   timestamptz not null default now()
);

-- ============================================================
-- CART (persisted per user; session carts handled client-side)
-- ============================================================
create table public.cart (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade unique,
  items      jsonb not null default '[]'::jsonb,
  -- items: [{productId, name, image, price, size, color, quantity}]
  updated_at timestamptz not null default now()
);

-- ============================================================
-- WISHLIST
-- ============================================================
create table public.wishlist (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rating     int not null check (rating between 1 and 5),
  title      text,
  comment    text,
  is_verified boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

-- ============================================================
-- USER PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  avatar_url text,
  role       text not null default 'customer', -- 'customer' | 'admin'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- WEBHOOK EVENTS (idempotency)
-- ============================================================
create table public.webhook_events (
  id             uuid primary key default uuid_generate_v4(),
  provider       text not null default 'razorpay',
  event_id       text not null unique,  -- Razorpay event id
  event_type     text not null,
  payload        jsonb not null,
  processed      boolean not null default false,
  processed_at   timestamptz,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_products_category on public.products(category_id);
create index idx_products_slug on public.products(slug);
create index idx_products_featured on public.products(is_featured) where is_featured = true;
create index idx_orders_user on public.orders(user_id);
create index idx_orders_razorpay_order on public.orders(razorpay_order_id);
create index idx_order_items_order on public.order_items(order_id);
create index idx_reviews_product on public.reviews(product_id);
create index idx_wishlist_user on public.wishlist(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.categories
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.addresses     enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.cart          enable row level security;
alter table public.wishlist      enable row level security;
alter table public.reviews       enable row level security;
alter table public.profiles      enable row level security;
alter table public.webhook_events enable row level security;

-- Categories: public read
create policy "categories_public_read" on public.categories
  for select using (true);

-- Products: public read of active products
create policy "products_public_read" on public.products
  for select using (is_active = true);

-- Profiles: users can read/update their own
create policy "profiles_own_read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);

-- Addresses: own only
create policy "addresses_own_crud" on public.addresses
  for all using (auth.uid() = user_id);

-- Orders: own only
create policy "orders_own_read" on public.orders
  for select using (auth.uid() = user_id);

-- Order items: own only via order
create policy "order_items_own_read" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );

-- Cart: own only
create policy "cart_own_crud" on public.cart
  for all using (auth.uid() = user_id);

-- Wishlist: own only
create policy "wishlist_own_crud" on public.wishlist
  for all using (auth.uid() = user_id);

-- Reviews: public read, own write
create policy "reviews_public_read" on public.reviews for select using (true);
create policy "reviews_own_write"   on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_own_update"  on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_own_delete"  on public.reviews for delete using (auth.uid() = user_id);

-- Webhook events: service role only (backend uses service role key, bypasses RLS)
create policy "webhook_events_none" on public.webhook_events for all using (false);
