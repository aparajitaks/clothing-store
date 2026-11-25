-- TeyaCollections — Migration 002
-- Adds: returns table, decrement_stock RPC, and missing indexes
-- Run after 001_initial_schema.sql

-- ============================================================
-- RETURNS TABLE
-- ============================================================
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

create index if not exists idx_returns_order on public.returns(order_id);
create index if not exists idx_returns_user  on public.returns(user_id);
create index if not exists idx_returns_status on public.returns(status);

-- Enable RLS
alter table public.returns enable row level security;

-- Admins (service role) can manage all returns; customers can read their own
create policy "returns_service_role_all" on public.returns
  for all using (false); -- service-role key bypasses RLS entirely

create policy "returns_user_read" on public.returns
  for select using (auth.uid() = user_id);

-- Updated_at trigger
create trigger set_updated_at before update on public.returns
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ORDERS TABLE: add coupon_code column if not present
-- ============================================================
alter table public.orders
  add column if not exists coupon_code text,
  add column if not exists tax_breakdown jsonb;

-- ============================================================
-- ATOMIC STOCK DECREMENT RPC
-- Used by the webhook handler to safely decrement stock.
-- Prevents race conditions and negative inventory.
-- ============================================================
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

-- ============================================================
-- ADDITIONAL INDEXES
-- ============================================================
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_products_active on public.products(is_active) where is_active = true;
create index if not exists idx_products_stock on public.products(stock) where stock > 0;
