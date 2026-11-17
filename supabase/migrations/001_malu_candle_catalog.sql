create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  product_type text not null default 'candle',
  base_price integer not null check (base_price >= 0),
  currency text not null default 'COP',
  status text not null default 'active' check (status in ('active','draft','archived')),
  featured boolean not null default false,
  seasonal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color text,
  fragrance text,
  size text,
  sku text unique,
  stock integer not null default 0 check (stock >= 0),
  production_days integer not null default 3 check (production_days >= 0),
  price_modifier integer not null default 0,
  active boolean not null default true,
  unique(product_id, color, fragrance, size)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  url text not null,
  alt text,
  sort_order integer not null default 0
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_type text not null default 'collection',
  image_url text,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key(product_id, category_id)
);

create table if not exists public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  country text default 'CO',
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','paid','in_production','shipped','completed','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','processing','paid','failed','refunded')),
  currency text not null default 'COP',
  subtotal integer not null default 0,
  shipping integer not null default 0,
  discount integer not null default 0,
  total integer not null default 0,
  shipping_address jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_snapshot jsonb,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view active products" on public.products;
drop policy if exists "Public can view active variants" on public.product_variants;
drop policy if exists "Public can view product images" on public.product_images;
drop policy if exists "Public can view active categories" on public.categories;
drop policy if exists "Public can view product categories" on public.product_categories;
drop policy if exists "Customers can view own profile" on public.customers;
drop policy if exists "Customers can update own profile" on public.customers;
drop policy if exists "Customers can view own orders" on public.orders;
drop policy if exists "Customers can view own order items" on public.order_items;

create policy "Public can view active products" on public.products for select to anon, authenticated using (status = 'active');
create policy "Public can view active variants" on public.product_variants for select to anon, authenticated using (active = true);
create policy "Public can view product images" on public.product_images for select to anon, authenticated using (true);
create policy "Public can view active categories" on public.categories for select to anon, authenticated using (active = true);
create policy "Public can view product categories" on public.product_categories for select to anon, authenticated using (true);
create policy "Customers can view own profile" on public.customers for select to authenticated using ((select auth.uid()) = id);
create policy "Customers can update own profile" on public.customers for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Customers can view own orders" on public.orders for select to authenticated using ((select auth.uid()) = customer_id);
create policy "Customers can view own order items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid())));

create index if not exists products_status_featured_idx on public.products(status, featured);
create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists order_customer_created_idx on public.orders(customer_id, created_at desc);
