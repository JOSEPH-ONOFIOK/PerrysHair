-- ============================================================
-- Perrys Hairline — Supabase Schema (idempotent, safe to re-run)
-- Run this in your Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- 2. PRODUCTS
create table if not exists public.products (
  id serial primary key,
  name text not null,
  category text not null,
  price integer not null,
  original_price integer,
  rating numeric(3,1) default 0,
  reviews integer default 0,
  best_seller boolean default false,
  in_stock boolean default true,
  length text,
  color text,
  description text,
  image text,
  created_at timestamptz default now()
);

-- 3. ORDERS
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users,
  date text not null,
  total integer not null,
  status integer default 0,
  delivery text not null,
  tracking text,
  customer_name text,
  customer_email text,
  created_at timestamptz default now()
);

-- 4. ORDER ITEMS
create table if not exists public.order_items (
  id serial primary key,
  order_id text references public.orders on delete cascade,
  product_id integer,
  product_name text,
  product_price integer,
  qty integer default 1
);

-- 5. SETTINGS (key-value store for delivery fees etc.)
create table if not exists public.settings (
  key text primary key,
  value text not null
);

-- Seed default delivery prices (safe to re-run)
insert into public.settings (key, value) values
  ('lagos', '2500'),
  ('nigeria', '5000'),
  ('international', '35000')
on conflict (key) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;

-- Settings: anyone can read, only admins can write
drop policy if exists "Anyone can read settings" on public.settings;
drop policy if exists "Admins can update settings" on public.settings;
create policy "Anyone can read settings"
  on public.settings for select using (true);
create policy "Admins can update settings"
  on public.settings for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Products: public read, admin write
drop policy if exists "Anyone can view products" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;
create policy "Anyone can view products"
  on public.products for select using (true);
create policy "Admins can insert products"
  on public.products for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
create policy "Admins can update products"
  on public.products for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
create policy "Admins can delete products"
  on public.products for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Orders: users see their own, admins see all
drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Users can insert orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select using (
    auth.uid() = user_id or
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
create policy "Users can insert orders"
  on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can update orders"
  on public.orders for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Order items
drop policy if exists "Users can view own order items" on public.order_items;
drop policy if exists "Users can insert order items" on public.order_items;
create policy "Users can view own order items"
  on public.order_items for select using (
    exists (
      select 1 from public.orders
      where id = order_id and (
        user_id = auth.uid() or
        exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
      )
    )
  );
create policy "Users can insert order items"
  on public.order_items for insert with check (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SEED PRODUCTS (skips if products already exist)
-- ============================================================
insert into public.products (name, category, price, original_price, rating, reviews, best_seller, in_stock, length, color, description, image)
select * from (values
  ('Sleek Bob Cut', 'Bobs', 45000, 55000, 4.8, 124, true, true, '12 inch', 'Jet Black', 'A flawlessly sleek, chin-length bob that exudes sophistication. Made with 100% virgin human hair, heat-resistant up to 220°C. Perfect for everyday elegance.', 'bob1'),
  ('Curly Goddess', 'Curly', 62000, 75000, 4.9, 89, true, true, '18 inch', 'Dark Brown', 'Bouncy, voluminous curls that command attention. Double-drawn Brazilian hair with natural luster. Tangle-free and minimal shedding.', 'curly1'),
  ('Beach Waves Lace Front', 'Wavy', 58000, null, 4.7, 67, false, true, '20 inch', 'Auburn', 'Effortless beachy waves with a natural hairline. 13x4 lace front wig. Pre-plucked with baby hair for an undetectable finish.', 'wavy1'),
  ('Bouncy Blowout', 'Bouncy', 52000, 60000, 4.6, 103, true, true, '22 inch', 'Natural Black', 'Full, luscious volume with a natural blowout style. Premium Malaysian hair. Stays bouncy all day with zero frizz.', 'bouncy1'),
  ('Bone Straight Silk', 'Bone Straight', 68000, null, 4.9, 201, true, true, '24 inch', 'Jet Black', 'Glass-smooth bone straight wig with a silk-like finish. Vietnamese raw hair, naturally straight without chemical treatment.', 'straight1'),
  ('Pixie Bob', 'Bobs', 38000, 44000, 4.5, 55, false, true, '8 inch', 'Burgundy', 'Chic and bold pixie bob with a burgundy tint. Human hair blend with a comfortable adjustable cap.', 'bob2'),
  ('Deep Wave Curls', 'Curly', 55000, 65000, 4.7, 78, false, false, '16 inch', 'Dark Brown', 'Defined deep wave curls with incredible bounce. 100% Peruvian human hair. Minimal maintenance, maximum glamour.', 'curly2'),
  ('Mermaid Waves', 'Wavy', 72000, null, 4.8, 92, true, true, '26 inch', 'Ombre Brown', 'Long, dramatic mermaid waves in a stunning ombre. HD full lace wig. The ultimate statement hair.', 'wavy2'),
  ('Volume Bouncy Curl', 'Bouncy', 48000, 56000, 4.6, 44, false, true, '20 inch', 'Natural Black', 'Super bouncy spiral curls with incredible volume. Brazilian remy hair. Perfect for special occasions.', 'bouncy2'),
  ('Ultra Straight Lace', 'Bone Straight', 78000, 90000, 5.0, 156, true, true, '28 inch', 'Jet Black', 'Absolutely straight HD lace frontal wig. The finest quality raw Vietnamese hair. Mirror-like shine.', 'straight2')
) as v(name, category, price, original_price, rating, reviews, best_seller, in_stock, length, color, description, image)
where not exists (select 1 from public.products limit 1);

-- ============================================================
-- GRANT ADMIN (run separately after signing up)
-- update public.profiles set is_admin = true where email = 'your@email.com';
-- ============================================================
