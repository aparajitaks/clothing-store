-- ============================================================
-- TEYA COLLECTIONS — COMPLETE DATABASE SETUP
-- Paste this entire file into Supabase SQL Editor and click RUN
-- ============================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. CATEGORIES
create table if not exists public.categories (
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

-- 3. PRODUCTS
create table if not exists public.products (
  id               uuid primary key default uuid_generate_v4(),
  category_id      uuid references public.categories(id) on delete set null,
  name             text not null,
  slug             text not null unique,
  description      text,
  price            numeric(10,2) not null check (price >= 0),
  compare_price    numeric(10,2) check (compare_price >= 0),
  images           jsonb not null default '[]'::jsonb,
  sizes            jsonb not null default '[]'::jsonb,
  colors           jsonb not null default '[]'::jsonb,
  stock            int not null default 0 check (stock >= 0),
  is_featured      boolean not null default false,
  is_active        boolean not null default true,
  meta_title       text,
  meta_description text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 4. ADDRESSES
create table if not exists public.addresses (
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

-- 5. ORDERS
do $$ begin
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
exception
  when duplicate_object then null;
end $$;

create table if not exists public.orders (
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
  coupon_code           text,
  tax_breakdown         jsonb,
  shipping_address      jsonb not null,
  payment_method        text,
  notes                 text,
  webhook_received_at   timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- 6. ORDER ITEMS
create table if not exists public.order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  size         text,
  color        text,
  quantity     int not null check (quantity > 0),
  unit_price   numeric(10,2) not null check (unit_price >= 0),
  total        numeric(10,2) not null check (total >= 0),
  created_at   timestamptz not null default now()
);

-- 7. CART
create table if not exists public.cart (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade unique,
  items      jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 8. WISHLIST
create table if not exists public.wishlist (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- 9. REVIEWS
create table if not exists public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  title       text,
  comment     text,
  is_verified boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

-- 10. USER PROFILES
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  avatar_url text,
  role       text not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. RETURNS TABLE
create table if not exists public.returns (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid references public.orders(id) on delete set null,
  user_id         uuid references auth.users(id) on delete set null,
  customer_name   text,
  customer_email  text,
  item_name       text not null,
  reason          text not null,
  status          text not null default 'pending'
                  check (status in ('pending', 'approved', 'refunded', 'rejected')),
  refund_amount   numeric(10,2) not null default 0 check (refund_amount >= 0),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 12. WEBHOOK EVENTS
create table if not exists public.webhook_events (
  id             uuid primary key default uuid_generate_v4(),
  provider       text not null default 'razorpay',
  event_id       text not null unique,
  event_type     text not null,
  payload        jsonb not null,
  processed      boolean not null default false,
  processed_at   timestamptz,
  created_at     timestamptz not null default now()
);

-- 13. INDEXES
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_featured on public.products(is_featured) where is_featured = true;
create index if not exists idx_products_active on public.products(is_active) where is_active = true;
create index if not exists idx_products_stock on public.products(stock) where stock > 0;
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_razorpay_order on public.orders(razorpay_order_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_wishlist_user on public.wishlist(user_id);
create index if not exists idx_returns_order on public.returns(order_id);
create index if not exists idx_returns_user on public.returns(user_id);
create index if not exists idx_returns_status on public.returns(status);

-- 14. UPDATED_AT TRIGGER
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.categories;
create trigger set_updated_at before update on public.categories
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.products;
create trigger set_updated_at before update on public.products
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.returns;
create trigger set_updated_at before update on public.returns
  for each row execute function public.handle_updated_at();

-- 15. AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 16. ATOMIC STOCK DECREMENT RPC
create or replace function public.decrement_stock(p_product_id uuid, p_quantity int)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stock = greatest(0, stock - p_quantity)
  where id = p_product_id;
end;
$$;

-- 17. ROW LEVEL SECURITY
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.addresses      enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.cart           enable row level security;
alter table public.wishlist       enable row level security;
alter table public.reviews        enable row level security;
alter table public.profiles       enable row level security;
alter table public.returns        enable row level security;
alter table public.webhook_events enable row level security;

-- Policies (re-creatable)
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select using (is_active = true);

drop policy if exists "profiles_own_read" on public.profiles;
create policy "profiles_own_read" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "addresses_own_crud" on public.addresses;
create policy "addresses_own_crud" on public.addresses for all using (auth.uid() = user_id);

drop policy if exists "orders_own_read" on public.orders;
create policy "orders_own_read" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "order_items_own_read" on public.order_items;
create policy "order_items_own_read" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);

drop policy if exists "cart_own_crud" on public.cart;
create policy "cart_own_crud" on public.cart for all using (auth.uid() = user_id);

drop policy if exists "wishlist_own_crud" on public.wishlist;
create policy "wishlist_own_crud" on public.wishlist for all using (auth.uid() = user_id);

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);

drop policy if exists "reviews_own_write" on public.reviews;
create policy "reviews_own_write" on public.reviews for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_own_update" on public.reviews;
create policy "reviews_own_update" on public.reviews for update using (auth.uid() = user_id);

drop policy if exists "reviews_own_delete" on public.reviews;
create policy "reviews_own_delete" on public.reviews for delete using (auth.uid() = user_id);

drop policy if exists "returns_service_role_all" on public.returns;
create policy "returns_service_role_all" on public.returns for all using (false);

drop policy if exists "returns_user_read" on public.returns;
create policy "returns_user_read" on public.returns for select using (auth.uid() = user_id);

drop policy if exists "webhook_events_none" on public.webhook_events;
create policy "webhook_events_none" on public.webhook_events for all using (false);

-- 18. INITIAL SEED DATA
insert into public.categories (id, name, slug, description, image_url, sort_order) values
  ('11111111-0000-0000-0000-000000000001', 'Dresses',      'dresses',     'Elegant dresses for every occasion', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800', 1),
  ('11111111-0000-0000-0000-000000000002', 'Tops',         'tops',        'Timeless tops and blouses',          'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800', 2),
  ('11111111-0000-0000-0000-000000000003', 'Bottoms',      'bottoms',     'Trousers, skirts and more',          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', 3),
  ('11111111-0000-0000-0000-000000000004', 'Ethnic Wear',  'ethnic-wear', 'Celebrating Indian craftsmanship',   'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', 4),
  ('11111111-0000-0000-0000-000000000005', 'Accessories',  'accessories', 'Complete your look',                 'https://images.unsplash.com/photo-1569397288884-4d43d6738fbd?w=800', 5)
on conflict (slug) do nothing;

insert into public.products (name, slug, category_id, description, price, compare_price, images, sizes, colors, stock, is_featured) values
  (
    'Rust Embroidered Kurta Set',
    'rust-embroidered-kurta-set',
    '11111111-0000-0000-0000-000000000001',
    'A striking two-piece ensemble in a rich rust hue, featuring a button-down tunic with a mandarin collar, 3/4th sleeves, and intricate floral cutwork scalloped embroidery along the hem and sleeve cuffs. Complemented with relaxed straight-fit trousers for effortless festive and celebratory elegance.',
    1784.00, 2099.00,
    '[{"url":"/products/rust-embroidered-kurta-set/front.jpg","alt":"Rust Embroidered Kurta Set — Front View","isPrimary":true,"type":"image"},{"url":"/products/rust-embroidered-kurta-set/back.jpg","alt":"Rust Embroidered Kurta Set — Back View","type":"image"},{"url":"/products/rust-embroidered-kurta-set/right.jpg","alt":"Rust Embroidered Kurta Set — Right Side Profile","type":"image"},{"url":"/products/rust-embroidered-kurta-set/left.jpg","alt":"Rust Embroidered Kurta Set — Left Side Profile","type":"image"},{"url":"/products/rust-embroidered-kurta-set/video.mp4","poster":"/products/rust-embroidered-kurta-set/video-poster.jpg","alt":"Rust Embroidered Kurta Set — Video Shoot","type":"video"}]',
    '["M","L","XL","XXL"]',
    '[{"name":"Rust Orange","hex":"#C2542D"}]',
    60, true
  )
on conflict (slug) do nothing;
