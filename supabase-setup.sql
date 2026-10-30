-- Amelia's Flowers & Decor: run this entire script in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(12,2),
  category text not null default 'Other',
  image_url text,
  is_new boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  key text primary key,
  value text not null default ''
);

alter table public.products enable row level security;
alter table public.store_settings enable row level security;

-- Anyone can read visible products; authenticated admins can manage the catalogue.
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products for select using (is_active = true or auth.role() = 'authenticated');
drop policy if exists "Authenticated admins can insert products" on public.products;
create policy "Authenticated admins can insert products" on public.products for insert to authenticated with check (true);
drop policy if exists "Authenticated admins can update products" on public.products;
create policy "Authenticated admins can update products" on public.products for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated admins can delete products" on public.products;
create policy "Authenticated admins can delete products" on public.products for delete to authenticated using (true);

drop policy if exists "Public can read store settings" on public.store_settings;
create policy "Public can read store settings" on public.store_settings for select using (true);
drop policy if exists "Authenticated admins can manage store settings" on public.store_settings;
create policy "Authenticated admins can manage store settings" on public.store_settings for all to authenticated using (true) with check (true);

-- Public image bucket. Only signed-in admins can upload, update or delete files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true, file_size_limit=5242880, allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects for select using (bucket_id='product-images');
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects for insert to authenticated with check (bucket_id='product-images');
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects for update to authenticated using (bucket_id='product-images') with check (bucket_id='product-images');
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects for delete to authenticated using (bucket_id='product-images');

insert into public.store_settings(key,value) values
('phone_display','0729 339 019'),
('phone_tel','+254729339019'),
('whatsapp_number','254784904677'),
('email','')
on conflict (key) do nothing;