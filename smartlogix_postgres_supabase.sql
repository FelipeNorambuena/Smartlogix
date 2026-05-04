-- SmartLogix PostgreSQL/Supabase refactor
-- Source: smartlogix.sql MySQL/MariaDB dump from legacy eCommerce monolith.
-- Target: logistics-oriented schemas for inventory, orders and shipping.

begin;

create extension if not exists pgcrypto;

create schema if not exists inventory;
create schema if not exists orders;
create schema if not exists shipping;

-- Supabase owns schema auth and table auth.users. Keep application profiles in public.users
-- and link them to Supabase Auth through auth_user_id after importing/creating auth users.

create or replace function public.uuid_from_text(input text)
returns uuid
language sql
immutable
as $$
  select (
    substr(md5(input), 1, 8) || '-' ||
    substr(md5(input), 9, 4) || '-' ||
    substr(md5(input), 13, 4) || '-' ||
    substr(md5(input), 17, 4) || '-' ||
    substr(md5(input), 21, 12)
  )::uuid;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  username text,
  email text,
  password_hash text,
  full_name text,
  rut text,
  phone text,
  default_address text,
  status text not null default 'active' check (status in ('active', 'inactive', 'blocked')),
  legacy_user_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('auth.users') is not null
     and not exists (
       select 1
       from pg_constraint
       where conname = 'users_auth_user_id_fkey'
         and conrelid = 'public.users'::regclass
     ) then
    alter table public.users
      add constraint users_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id) on delete set null;
  end if;
end $$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('cliente', 'trabajador_logistico', 'admin')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists inventory.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  description text,
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  category text,
  is_active boolean not null default true,
  legacy_product_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inventory.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references inventory.products(id) on delete cascade,
  stock_available integer not null default 0 check (stock_available >= 0),
  stock_reserved integer not null default 0 check (stock_reserved >= 0),
  warehouse_location text,
  reorder_point integer not null default 0 check (reorder_point >= 0),
  legacy_inventory_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (stock_reserved <= stock_available)
);

create table if not exists orders.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
  total numeric(12,2) not null default 0 check (total >= 0),
  currency char(3) not null default 'CLP',
  shipping_address text,
  legacy_sale_id integer unique,
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders.orders(id) on delete cascade,
  product_id uuid not null references inventory.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) generated always as (quantity * unit_price) stored,
  legacy_order_item_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists shipping.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders.orders(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'ready_to_ship', 'in_transit', 'delivered', 'failed', 'returned', 'cancelled')),
  shipping_address text not null,
  carrier text,
  tracking_number text unique,
  shipped_at timestamptz,
  delivered_at timestamptz,
  legacy_shipment_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists shipping.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references shipping.shipments(id) on delete cascade,
  status text not null,
  location text,
  description text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Optional replacement for legacy cupones. Not part of the core microservices.
create table if not exists orders.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent numeric(5,2) not null check (discount_percent > 0 and discount_percent <= 100),
  valid_until date,
  is_active boolean not null default true,
  legacy_coupon_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_auth_user_id on public.users(auth_user_id);
create index if not exists idx_users_legacy_user_id on public.users(legacy_user_id);
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_role_id on public.user_roles(role_id);
create index if not exists idx_products_sku on inventory.products(sku);
create index if not exists idx_inventory_product_id on inventory.inventory(product_id);
create index if not exists idx_orders_user_id on orders.orders(user_id);
create index if not exists idx_order_items_order_id on orders.order_items(order_id);
create index if not exists idx_order_items_product_id on orders.order_items(product_id);
create index if not exists idx_shipments_order_id on shipping.shipments(order_id);
create index if not exists idx_shipment_events_shipment_id on shipping.shipment_events(shipment_id);

create or replace function public.current_user_has_role(role_names text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    join public.user_roles ur on ur.user_id = u.id
    join public.roles r on r.id = ur.role_id
    where u.auth_user_id = auth.uid()
      and r.name = any(role_names)
  );
$$;

drop trigger if exists set_updated_at_users on public.users;
create trigger set_updated_at_users
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_roles on public.roles;
create trigger set_updated_at_roles
before update on public.roles
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_products on inventory.products;
create trigger set_updated_at_products
before update on inventory.products
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_inventory on inventory.inventory;
create trigger set_updated_at_inventory
before update on inventory.inventory
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_orders on orders.orders;
create trigger set_updated_at_orders
before update on orders.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_order_items on orders.order_items;
create trigger set_updated_at_order_items
before update on orders.order_items
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_shipments on shipping.shipments;
create trigger set_updated_at_shipments
before update on shipping.shipments
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_coupons on orders.coupons;
create trigger set_updated_at_coupons
before update on orders.coupons
for each row execute function public.set_updated_at();

create or replace function orders.recalculate_order_total(target_order_id uuid)
returns void
language plpgsql
as $$
begin
  update orders.orders o
  set total = coalesce((
    select sum(oi.line_total)
    from orders.order_items oi
    where oi.order_id = target_order_id
  ), 0),
  updated_at = now()
  where o.id = target_order_id;
end;
$$;

create or replace function orders.apply_order_item_stock()
returns trigger
language plpgsql
as $$
declare
  available_stock integer;
begin
  select stock_available
  into available_stock
  from inventory.inventory
  where product_id = new.product_id
  for update;

  if available_stock is null then
    raise exception 'No inventory record exists for product %', new.product_id;
  end if;

  if available_stock < new.quantity then
    raise exception 'Insufficient stock for product %. Available %, requested %',
      new.product_id, available_stock, new.quantity;
  end if;

  update inventory.inventory
  set stock_available = stock_available - new.quantity,
      updated_at = now()
  where product_id = new.product_id;

  perform orders.recalculate_order_total(new.order_id);
  return new;
end;
$$;

drop trigger if exists order_items_decrement_stock on orders.order_items;
create trigger order_items_decrement_stock
after insert on orders.order_items
for each row execute function orders.apply_order_item_stock();

create or replace function orders.restore_order_item_stock()
returns trigger
language plpgsql
as $$
begin
  update inventory.inventory
  set stock_available = stock_available + old.quantity,
      updated_at = now()
  where product_id = old.product_id;

  perform orders.recalculate_order_total(old.order_id);
  return old;
end;
$$;

drop trigger if exists order_items_restore_stock on orders.order_items;
create trigger order_items_restore_stock
after delete on orders.order_items
for each row execute function orders.restore_order_item_stock();

create or replace function orders.adjust_order_item_stock()
returns trigger
language plpgsql
as $$
declare
  quantity_delta integer;
  available_stock integer;
begin
  if old.product_id <> new.product_id then
    update inventory.inventory
    set stock_available = stock_available + old.quantity,
        updated_at = now()
    where product_id = old.product_id;

    select stock_available
    into available_stock
    from inventory.inventory
    where product_id = new.product_id
    for update;

    if available_stock is null or available_stock < new.quantity then
      raise exception 'Insufficient stock for product %', new.product_id;
    end if;

    update inventory.inventory
    set stock_available = stock_available - new.quantity,
        updated_at = now()
    where product_id = new.product_id;
  else
    quantity_delta := new.quantity - old.quantity;

    if quantity_delta > 0 then
      select stock_available
      into available_stock
      from inventory.inventory
      where product_id = new.product_id
      for update;

      if available_stock < quantity_delta then
        raise exception 'Insufficient stock for product %. Available %, requested additional %',
          new.product_id, available_stock, quantity_delta;
      end if;
    end if;

    update inventory.inventory
    set stock_available = stock_available - quantity_delta,
        updated_at = now()
    where product_id = new.product_id;
  end if;

  perform orders.recalculate_order_total(new.order_id);
  if old.order_id <> new.order_id then
    perform orders.recalculate_order_total(old.order_id);
  end if;

  return new;
end;
$$;

drop trigger if exists order_items_adjust_stock on orders.order_items;
create trigger order_items_adjust_stock
after update of product_id, quantity, unit_price, order_id on orders.order_items
for each row execute function orders.adjust_order_item_stock();

insert into public.roles (id, name, description)
values
  (public.uuid_from_text('role:cliente'), 'cliente', 'Cliente que crea pedidos y consulta sus envios.'),
  (public.uuid_from_text('role:trabajador_logistico'), 'trabajador_logistico', 'Operador logistico que gestiona inventario, pedidos y envios.'),
  (public.uuid_from_text('role:admin'), 'admin', 'Administrador de la plataforma.')
on conflict (name) do update
set description = excluded.description,
    updated_at = now();

insert into public.users (id, username, email, password_hash, full_name, rut, phone, default_address, status, legacy_user_id)
values
  (public.uuid_from_text('user:8'), 'juanbustos', 'nuevo@email.com', '$2a$10$lt154kkMDd1fR7Ak6ql5v.YsGzGRVrZcURoUnsUZE1bkGMrIgZSwi', 'Juan Bustos', '12.345.678-9', '+56911112222', 'Av. Siempre Viva 123', 'active', 8),
  (public.uuid_from_text('user:10'), 'admin', 'admin01@ejemplo.com', '$2a$10$8j2oZXxk8hEfNtjzs7tx7./hodZx0BC27cP4WbZIpMDEYfij4CRHi', null, null, null, null, 'active', 10),
  (public.uuid_from_text('user:11'), 'admin01', 'admin01@ejemplo.com', '$2a$10$V3yg9OTQxQJQuOQHx8jSeegoN5nJaaozqQwdQQnJRdyOP.6Aj2/Me', null, null, null, null, 'active', 11),
  (public.uuid_from_text('user:12'), 'vendedor01', 'vendedor01@ejemplo.com', '$2a$10$15NtyP1URZUvu5LT2wGzZehRtLp9J.9X00VLQMYuA5deGC1dzXNPy', 'Camila Perez', '11.223.334-5', null, 'Region Metropolitana', 'active', 12),
  (public.uuid_from_text('user:13'), 'cliente1', 'cliente1@example.com', '$2a$10$KgOR5iaHvpgIL.JFAHwsWeCe9d3qS4co3fqXmdjMsTl6fEPA1VXei', 'Cliente Uno', '11.111.111-1', '+56911110001', 'Calle Falsa 123', 'active', 13),
  (public.uuid_from_text('user:14'), 'cliente2', 'cliente2@example.com', '$2a$10$XmGEuP/u5/hCu1XmpTJNLuFplkwHE.D6.lWQhuluNGRKEWFN4wOnC', 'Cliente Dos', '22.222.222-2', '+56911110002', 'Calle Falsa 124', 'active', 14),
  (public.uuid_from_text('user:15'), 'cliente3', 'cliente3@example.com', '$2a$10$SzlsPx/6qT0g4FMYwkzutOp20v5ISzb0yMwhW0xZsFiIo3jIjc2UW', 'Cliente Tres', '33.333.333-3', '+56911110003', 'Calle Falsa 125', 'active', 15),
  (public.uuid_from_text('user:16'), 'cliente4', 'cliente4@example.com', '$2a$10$6TrjrBR.URogRIIT1pD6sOUM28VqIinUy/QFNsEuIvOWiI9CON2pu', 'Cliente Cuatro', '44.444.444-4', '+56911110004', 'Calle Falsa 126', 'active', 16),
  (public.uuid_from_text('user:17'), 'cliente5', 'cliente5@example.com', '$2a$10$PHwWstVniUw7cUqn7y3vMOaQ8/XZ0IeybydZPueE7XLGls9bdAf2G', 'Cliente Cinco', '55.555.555-5', '+56911110005', 'Calle Falsa 127', 'active', 17),
  (public.uuid_from_text('user:18'), 'cliente6', 'cliente6@example.com', '$2a$10$PPBnYCsMGnyzMG6H1ljqX.1tgyem6/ORDBowK663.mMqXnXHuQ0fm', 'Cliente Seis', '66.666.666-6', '+56911110006', 'Calle Falsa 128', 'active', 18),
  (public.uuid_from_text('user:19'), 'cliente7', 'cliente7@example.com', '$2a$10$EdKZc7oi/1kliOCjdPrJA.d2S5OD4wxBSYElcwUjN/OKJ3VDEbXCu', 'Cliente Siete', '77.777.777-7', '+56911110007', 'Calle Falsa 129', 'active', 19),
  (public.uuid_from_text('user:20'), 'cliente8', 'cliente8@example.com', '$2a$10$KwMJn1EyiFU69tFa5uSXJ.BXR/pjuOLx0jm5CRAtohiX98qHxvFjG', 'Cliente Ocho', '88.888.888-8', '+56911110008', 'Calle Falsa 130', 'active', 20),
  (public.uuid_from_text('user:21'), 'cliente9', 'cliente9@example.com', '$2a$10$juOJbJ3hWUWE.Z7.kG9A8euIuByBlcinz./FFcP3OOjwowkXUSzY.', 'Cliente Nueve', '99.999.999-9', '+56911110009', 'Calle Falsa 131', 'active', 21),
  (public.uuid_from_text('user:22'), 'cliente10', 'cliente10@example.com', '$2a$10$teBHY4s3rGe0V2sACWOjXeMgxjMF069s8Gw2bCLIuk3FK3OG1hD5W', null, null, null, null, 'active', 22),
  (public.uuid_from_text('user:23'), 'admin02', 'admin02@ejemplo.com', '$2a$10$uB.NHk1sHd.M7/oGt9a41uWCh6AMX7.ZO3X2T51fhmbYV7ry1/GGu', null, null, null, null, 'active', 23),
  (public.uuid_from_text('user:24'), 'admin03', 'admin03@ejemplo.com', '$2a$10$g55g7fz0kfgfeB0pDBx4euH2socvkXL6YH3oKIK5NVF/nXBwLNWNC', null, null, null, null, 'active', 24),
  (public.uuid_from_text('user:25'), 'vendedor02', 'vendedor02@ejemplo.com', '$2a$10$M1p76T7gB2PXJIRc6QLBV.qeBVtVBzsLLRi.INnYiRAo1qmHm.Zza', 'Jorge Morales', '12.345.678-9', null, 'santiago', 'active', 25),
  (public.uuid_from_text('user:26'), 'vendedor03', 'vendedor03@ejemplo.com', '$2a$10$6m6pJ9BGuhwx.LU6n1WYqubuuP0LYkpexI.ZBNdnzyAU2oUVMZN5y', 'Valentina Soto', '13.456.789-0', null, 'santiago', 'active', 26),
  (public.uuid_from_text('user:27'), 'vendedor04', 'vendedor04@ejemplo.com', '$2a$10$YVF.zxZOUIWHi2mkzMJokuZFKId8Bm6fGPPC.j57kDtk7GTcUxrw2', 'Ricardo Fuentes', '14.567.890-1', null, 'concepcion', 'active', 27),
  (public.uuid_from_text('user:28'), 'vendedor05', 'vendedor05@ejemplo.com', '$2a$10$eMOuMGttNV5O6YUZvpKgEunw6FxU8lDXvrCf2zUpCImCNU4Ks3W4q', 'Fernanda Reyes', '15.678.901-2', null, 'concepcion', 'active', 28),
  (public.uuid_from_text('user:29'), 'vendedor06', 'vendedor06@ejemplo.com', '$2a$10$oT.ZJOtH/keG9Jkrons/3eRyl2xZZDonkbo4A2H.Gc6AgClEgQLtG', 'Martin Vera', '16.789.012-3', null, 'concepcion', 'active', 29),
  (public.uuid_from_text('user:30'), 'vendedor07', 'vendedor07@ejemplo.com', '$2a$10$nNgZBmBBwkfNuiVU2BXlHexfAbnXk8LGD7C5bTrRPqx.Ky8tb/TGm', 'Catalina Rivas', '17.890.123-4', null, 'vina del mar', 'active', 30),
  (public.uuid_from_text('user:31'), 'vendedor08', 'vendedor08@ejemplo.com', '$2a$10$/QH1VDQRLNrZJjnfs/QwH.OUsl9S7PeYnSHLT5ocxtOUGPpYykrI6', 'Andres Paredes', '18.901.234-5', null, 'vina del mar', 'active', 31),
  (public.uuid_from_text('user:32'), 'vendedor09', 'vendedor09@ejemplo.com', '$2a$10$tvrGP4tK9gfmJE57ZZFE6Od4YaPfHga1uJIa5eiC39EkUI/UQYr8q', 'Nicole Gutierrez', '19.012.345-6', null, 'vina del mar', 'active', 32),
  (public.uuid_from_text('user:33'), 'vendedor10', 'vendedor10@ejemplo.com', '$2a$10$tukaPQQIj/4XbixW3sLQFeliTSeB45gkXc9Q4azlo9PCW0ptPqYhq', 'Benjamin Silva', '20.123.456-7', null, 'concepcion', 'active', 33),
  (public.uuid_from_text('user:34'), 'divino', 'eldivino@example.com', '$2a$10$Pa.mHOMCAnBFt/jPm2dIUug6OU7MtNlRjWy1OtY0llbdaEOMlwDe6', 'divino cliente', '11.111.111-1', '+56911112222', 'Av. Siempre divo 123', 'active', 34)
on conflict (legacy_user_id) do update
set username = excluded.username,
    email = excluded.email,
    password_hash = excluded.password_hash,
    full_name = excluded.full_name,
    rut = excluded.rut,
    phone = excluded.phone,
    default_address = excluded.default_address,
    status = excluded.status,
    updated_at = now();

insert into public.user_roles (user_id, role_id)
select public.uuid_from_text('user:' || legacy_id), public.uuid_from_text('role:' || role_name)
from (
  values
    (8, 'cliente'), (10, 'admin'), (11, 'admin'), (12, 'trabajador_logistico'),
    (13, 'cliente'), (14, 'cliente'), (15, 'cliente'), (16, 'cliente'), (17, 'cliente'),
    (18, 'cliente'), (19, 'cliente'), (20, 'cliente'), (21, 'cliente'), (22, 'cliente'),
    (23, 'admin'), (24, 'admin'), (25, 'trabajador_logistico'), (26, 'trabajador_logistico'),
    (27, 'trabajador_logistico'), (28, 'trabajador_logistico'), (29, 'trabajador_logistico'),
    (30, 'trabajador_logistico'), (31, 'trabajador_logistico'), (32, 'trabajador_logistico'),
    (33, 'trabajador_logistico'), (34, 'cliente')
) as legacy_roles(legacy_id, role_name)
on conflict do nothing;

insert into inventory.products (id, sku, name, description, unit_price, category, is_active, legacy_product_id)
values
  (public.uuid_from_text('product:4'), 'SLX-000004', 'Dolce & Gabbana Light Blue Pour Homme EDT', 'Fragancia masculina fresca y vibrante, inspirada en el espiritu del Mediterraneo. Combina notas citricas y amaderadas para una sensacion limpia, energetica y sofisticada.', 61990, 'Fragancia masculina', true, 4),
  (public.uuid_from_text('product:5'), 'SLX-000005', 'Dior Sauvage Parfum', 'Aroma masculino intenso y sofisticado, con notas de bergamota, vainilla y madera.', 89990, 'Fragancia masculina', true, 5),
  (public.uuid_from_text('product:6'), 'SLX-000006', 'Acqua Di Gio Profumo', 'Fragancia elegante con notas marinas, incienso y pachuli. Ideal para la noche.', 84990, 'Fragancia masculina', true, 6),
  (public.uuid_from_text('product:7'), 'SLX-000007', 'Bleu de Chanel', 'Notas amaderadas y citricas. Aroma fresco y masculino para uso diario o de oficina.', 79990, 'Fragancia masculina', true, 7),
  (public.uuid_from_text('product:8'), 'SLX-000008', 'Invictus Paco Rabanne', 'Notas frescas con toques dulces y amaderados. Perfume moderno y juvenil.', 69990, 'Fragancia masculina', true, 8),
  (public.uuid_from_text('product:9'), 'SLX-000009', 'Dolce & Gabbana The One for Men', 'Fragancia calida y especiada. Elegancia clasica para hombres sofisticados.', 65990, 'Fragancia masculina', true, 9),
  (public.uuid_from_text('product:10'), 'SLX-000010', 'Chanel Coco Mademoiselle', 'Elegante fragancia femenina con notas florales y toques de ambar y vainilla.', 94990, 'Fragancia femenina', true, 10),
  (public.uuid_from_text('product:11'), 'SLX-000011', 'Lancome La Vie Est Belle', 'Dulce y floral, esta fragancia es sinonimo de feminidad y libertad.', 84990, 'Fragancia femenina', true, 11),
  (public.uuid_from_text('product:12'), 'SLX-000012', 'Carolina Herrera Good Girl', 'Seductora mezcla de flores blancas y cacao. Sensual y poderosa.', 81990, 'Fragancia femenina', true, 12),
  (public.uuid_from_text('product:13'), 'SLX-000013', 'YSL Black Opium', 'Aroma adictivo de cafe, vainilla y flores blancas. Ideal para la noche.', 78990, 'Fragancia femenina', true, 13),
  (public.uuid_from_text('product:14'), 'SLX-000014', 'Escada Flor del Sol', 'Fragancia veraniega y frutal, con notas de granada y citricos tropicales.', 59990, 'Fragancia femenina', true, 14),
  (public.uuid_from_text('product:15'), 'SLX-000015', 'Tom Ford Neroli Portofino', 'Fragancia citrica y sofisticada, ideal para cualquier genero. Inspirada en la costa italiana.', 112990, 'Fragancia unisex', true, 15),
  (public.uuid_from_text('product:16'), 'SLX-000016', 'CK One', 'Clasica fragancia fresca, ligera y unisex. Perfecta para uso diario.', 48990, 'Fragancia unisex', true, 16),
  (public.uuid_from_text('product:17'), 'SLX-000017', 'Maison Margiela Lazy Sunday Morning', 'Aroma suave a flores blancas y almizcle, unisex y reconfortante.', 87990, 'Fragancia unisex', true, 17),
  (public.uuid_from_text('product:18'), 'SLX-000018', 'Byredo Blanche', 'Fragancia minimalista, limpia y floral. Ideal para quienes buscan sutileza.', 98990, 'Fragancia unisex', true, 18),
  (public.uuid_from_text('product:19'), 'SLX-000019', 'Acqua di Parma Colonia', 'Citrica, ligera y clasica. Unisex, con gran frescura.', 65990, 'Fragancia unisex', true, 19),
  (public.uuid_from_text('product:20'), 'SLX-000020', 'Victorias Secret Pure Seduction', 'Bruma corporal frutal con ciruela roja y fresia. Ligera y juvenil.', 10990, 'Body Mist', true, 20),
  (public.uuid_from_text('product:21'), 'SLX-000021', 'Bath & Body Works Gingham', 'Bruma fresca con notas citricas y florales. Ideal para despues de la ducha.', 17990, 'Body Mist', true, 21),
  (public.uuid_from_text('product:22'), 'SLX-000022', 'Victorias Secret Love Spell', 'Bruma con mezcla de cereza, durazno y flor de azahar. Dulce y romantica.', 19990, 'Body Mist', true, 22),
  (public.uuid_from_text('product:23'), 'SLX-000023', 'Bath & Body Works Into the Night', 'Bruma intensa con grosellas negras y ambar. Ideal para salidas nocturnas.', 18990, 'Body Mist', true, 23),
  (public.uuid_from_text('product:24'), 'SLX-000024', 'Ariana Grande Cloud Body Mist', 'Aroma ligero de crema batida, coco y lavanda. Version bruma del famoso perfume.', 17990, 'Body Mist', true, 24),
  (public.uuid_from_text('product:25'), 'SLX-000025', 'Miniatura Dior Homme Sport', 'Miniatura de 10 ml ideal para viajes. Notas citricas y frescas con toque especiado.', 11990, 'Miniatura', true, 25),
  (public.uuid_from_text('product:26'), 'SLX-000026', 'Miniatura Versace Eros', 'Tamano compacto de 5 ml. Fragancia intensa, masculina y elegante.', 9990, 'Miniatura', true, 26),
  (public.uuid_from_text('product:27'), 'SLX-000027', 'Set de Regalo Calvin Klein Women', 'Incluye perfume 50 ml, crema corporal y miniatura. Ideal para regalar.', 65990, 'Set de regalo', true, 27),
  (public.uuid_from_text('product:28'), 'SLX-000028', 'Set de Regalo Jean Paul Gaultier Scandal', 'Estuche con perfume, locion corporal y miniatura. Edicion especial.', 75990, 'Set de regalo', true, 28),
  (public.uuid_from_text('product:30'), 'SLX-000030', 'esika', 'fragancia de la alta alcurnia', 5990, 'macho', true, 30)
on conflict (legacy_product_id) do update
set sku = excluded.sku,
    name = excluded.name,
    description = excluded.description,
    unit_price = excluded.unit_price,
    category = excluded.category,
    is_active = excluded.is_active,
    updated_at = now();

insert into inventory.inventory (id, product_id, stock_available, warehouse_location, legacy_inventory_id)
values
  (public.uuid_from_text('inventory:1'), public.uuid_from_text('product:4'), 500, 'Concepcion', 1),
  (public.uuid_from_text('inventory:2'), public.uuid_from_text('product:5'), 500, 'Concepcion', 2),
  (public.uuid_from_text('inventory:3'), public.uuid_from_text('product:6'), 350, 'Santiago', 3),
  (public.uuid_from_text('inventory:4'), public.uuid_from_text('product:7'), 400, 'Vina del Mar', 4),
  (public.uuid_from_text('inventory:5'), public.uuid_from_text('product:8'), 300, 'Concepcion', 5),
  (public.uuid_from_text('inventory:6'), public.uuid_from_text('product:9'), 450, 'Santiago', 6),
  (public.uuid_from_text('inventory:7'), public.uuid_from_text('product:10'), 380, 'Vina del Mar', 7),
  (public.uuid_from_text('inventory:8'), public.uuid_from_text('product:11'), 420, 'Concepcion', 8),
  (public.uuid_from_text('inventory:9'), public.uuid_from_text('product:12'), 500, 'Santiago', 9),
  (public.uuid_from_text('inventory:10'), public.uuid_from_text('product:13'), 350, 'Vina del Mar', 10),
  (public.uuid_from_text('inventory:11'), public.uuid_from_text('product:14'), 370, 'Concepcion', 11),
  (public.uuid_from_text('inventory:12'), public.uuid_from_text('product:15'), 420, 'Santiago', 12),
  (public.uuid_from_text('inventory:13'), public.uuid_from_text('product:16'), 390, 'Vina del Mar', 13),
  (public.uuid_from_text('inventory:14'), public.uuid_from_text('product:17'), 330, 'Concepcion', 14),
  (public.uuid_from_text('inventory:15'), public.uuid_from_text('product:18'), 460, 'Santiago', 15),
  (public.uuid_from_text('inventory:16'), public.uuid_from_text('product:19'), 410, 'Vina del Mar', 16),
  (public.uuid_from_text('inventory:17'), public.uuid_from_text('product:20'), 490, 'Concepcion', 17),
  (public.uuid_from_text('inventory:18'), public.uuid_from_text('product:21'), 320, 'Santiago', 18),
  (public.uuid_from_text('inventory:19'), public.uuid_from_text('product:22'), 350, 'Vina del Mar', 19),
  (public.uuid_from_text('inventory:20'), public.uuid_from_text('product:23'), 270, 'Concepcion', 20),
  (public.uuid_from_text('inventory:21'), public.uuid_from_text('product:24'), 310, 'Santiago', 21),
  (public.uuid_from_text('inventory:22'), public.uuid_from_text('product:25'), 290, 'Vina del Mar', 22),
  (public.uuid_from_text('inventory:23'), public.uuid_from_text('product:26'), 230, 'Concepcion', 23),
  (public.uuid_from_text('inventory:24'), public.uuid_from_text('product:27'), 340, 'Santiago', 24),
  (public.uuid_from_text('inventory:25'), public.uuid_from_text('product:28'), 280, 'Vina del Mar', 25)
on conflict (legacy_inventory_id) do update
set stock_available = excluded.stock_available,
    warehouse_location = excluded.warehouse_location,
    updated_at = now();

insert into orders.orders (id, user_id, status, total, shipping_address, legacy_sale_id, placed_at, created_at)
values
  (public.uuid_from_text('order:1'), public.uuid_from_text('user:8'), 'pending', 0, 'Av. Siempre Viva 123', 1, '2025-06-01 00:00:00+00', '2025-06-01 00:00:00+00'),
  (public.uuid_from_text('order:2'), public.uuid_from_text('user:13'), 'delivered', 0, 'Calle Falsa 123', 2, '2025-06-02 00:00:00+00', '2025-06-02 00:00:00+00'),
  (public.uuid_from_text('order:3'), public.uuid_from_text('user:14'), 'pending', 0, 'Calle Falsa 124', 3, '2025-06-02 00:00:00+00', '2025-06-02 00:00:00+00'),
  (public.uuid_from_text('order:4'), public.uuid_from_text('user:15'), 'pending', 0, 'Calle Falsa 125', 4, '2025-06-03 00:00:00+00', '2025-06-03 00:00:00+00'),
  (public.uuid_from_text('order:5'), public.uuid_from_text('user:16'), 'pending', 0, 'Calle Falsa 126', 5, '2025-06-03 00:00:00+00', '2025-06-03 00:00:00+00'),
  (public.uuid_from_text('order:6'), public.uuid_from_text('user:17'), 'pending', 0, 'Calle Falsa 127', 6, '2025-06-04 00:00:00+00', '2025-06-04 00:00:00+00'),
  (public.uuid_from_text('order:7'), public.uuid_from_text('user:18'), 'pending', 0, 'Calle Falsa 128', 7, '2025-06-05 00:00:00+00', '2025-06-05 00:00:00+00'),
  (public.uuid_from_text('order:8'), public.uuid_from_text('user:19'), 'pending', 0, 'Calle Falsa 129', 8, '2025-06-05 00:00:00+00', '2025-06-05 00:00:00+00'),
  (public.uuid_from_text('order:9'), public.uuid_from_text('user:20'), 'pending', 0, 'Calle Falsa 130', 9, '2025-06-06 00:00:00+00', '2025-06-06 00:00:00+00'),
  (public.uuid_from_text('order:10'), public.uuid_from_text('user:21'), 'pending', 0, 'Calle Falsa 131', 10, '2025-06-07 00:00:00+00', '2025-06-07 00:00:00+00'),
  (public.uuid_from_text('order:11'), public.uuid_from_text('user:14'), 'pending', 0, 'Calle Falsa 124', 11, '2025-06-08 19:52:04+00', '2025-06-08 19:52:04+00'),
  (public.uuid_from_text('order:12'), public.uuid_from_text('user:8'), 'pending', 0, 'Av. Siempre Viva 123', 12, '2025-06-01 00:00:00+00', '2025-06-01 00:00:00+00'),
  (public.uuid_from_text('order:13'), public.uuid_from_text('user:13'), 'pending', 0, 'Calle Falsa 123', 13, '2025-06-02 00:00:00+00', '2025-06-02 00:00:00+00'),
  (public.uuid_from_text('order:14'), public.uuid_from_text('user:14'), 'pending', 0, 'Calle Falsa 124', 14, '2025-06-02 00:00:00+00', '2025-06-02 00:00:00+00'),
  (public.uuid_from_text('order:15'), public.uuid_from_text('user:15'), 'pending', 0, 'Calle Falsa 125', 15, '2025-06-03 00:00:00+00', '2025-06-03 00:00:00+00'),
  (public.uuid_from_text('order:16'), public.uuid_from_text('user:16'), 'pending', 0, 'Calle Falsa 126', 16, '2025-06-03 00:00:00+00', '2025-06-03 00:00:00+00'),
  (public.uuid_from_text('order:17'), public.uuid_from_text('user:17'), 'pending', 0, 'Calle Falsa 127', 17, '2025-06-04 00:00:00+00', '2025-06-04 00:00:00+00'),
  (public.uuid_from_text('order:18'), public.uuid_from_text('user:18'), 'pending', 0, 'Calle Falsa 128', 18, '2025-06-05 00:00:00+00', '2025-06-05 00:00:00+00'),
  (public.uuid_from_text('order:19'), public.uuid_from_text('user:19'), 'pending', 0, 'Calle Falsa 129', 19, '2025-06-05 00:00:00+00', '2025-06-05 00:00:00+00'),
  (public.uuid_from_text('order:20'), public.uuid_from_text('user:20'), 'pending', 0, 'Calle Falsa 130', 20, '2025-06-06 00:00:00+00', '2025-06-06 00:00:00+00'),
  (public.uuid_from_text('order:21'), public.uuid_from_text('user:21'), 'pending', 0, 'Calle Falsa 131', 21, '2025-06-07 00:00:00+00', '2025-06-07 00:00:00+00')
on conflict (legacy_sale_id) do update
set user_id = excluded.user_id,
    status = excluded.status,
    total = excluded.total,
    shipping_address = excluded.shipping_address,
    placed_at = excluded.placed_at,
    updated_at = now();

insert into shipping.shipments (
  id, order_id, status, shipping_address, shipped_at, delivered_at, legacy_shipment_id
)
values (
  public.uuid_from_text('shipment:7'),
  public.uuid_from_text('order:2'),
  'delivered',
  'Calle Los Alamos 456, Concepcion',
  '2025-06-06 00:00:00+00',
  '2025-06-08 00:00:00+00',
  7
)
on conflict (legacy_shipment_id) do update
set order_id = excluded.order_id,
    status = excluded.status,
    shipping_address = excluded.shipping_address,
    shipped_at = excluded.shipped_at,
    delivered_at = excluded.delivered_at,
    updated_at = now();

insert into shipping.shipment_events (id, shipment_id, status, location, description, occurred_at)
values
  (public.uuid_from_text('shipment_event:7:created'), public.uuid_from_text('shipment:7'), 'ready_to_ship', 'Concepcion', 'Envio legacy importado desde smartlogix.sql.', '2025-06-06 00:00:00+00'),
  (public.uuid_from_text('shipment_event:7:delivered'), public.uuid_from_text('shipment:7'), 'delivered', 'Concepcion', 'Pedido entregado segun fecha_entrega legacy.', '2025-06-08 00:00:00+00')
on conflict (id) do nothing;

-- Row Level Security baseline. Service role bypasses RLS; API clients are constrained.
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table inventory.products enable row level security;
alter table inventory.inventory enable row level security;
alter table orders.orders enable row level security;
alter table orders.order_items enable row level security;
alter table shipping.shipments enable row level security;
alter table shipping.shipment_events enable row level security;
alter table orders.coupons enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own
on public.users for select
using (auth.uid() = auth_user_id);

drop policy if exists users_update_own on public.users;
create policy users_update_own
on public.users for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists roles_read_all on public.roles;
create policy roles_read_all
on public.roles for select
using (true);

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own
on public.user_roles for select
using (
  exists (
    select 1 from public.users u
    where u.id = user_roles.user_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists products_read_active on inventory.products;
create policy products_read_active
on inventory.products for select
using (is_active = true);

drop policy if exists products_manage_logistics on inventory.products;
create policy products_manage_logistics
on inventory.products for all
using (public.current_user_has_role(array['trabajador_logistico', 'admin']))
with check (public.current_user_has_role(array['trabajador_logistico', 'admin']));

drop policy if exists inventory_read_all on inventory.inventory;
create policy inventory_read_all
on inventory.inventory for select
using (true);

drop policy if exists inventory_manage_logistics on inventory.inventory;
create policy inventory_manage_logistics
on inventory.inventory for all
using (public.current_user_has_role(array['trabajador_logistico', 'admin']))
with check (public.current_user_has_role(array['trabajador_logistico', 'admin']));

drop policy if exists orders_select_own on orders.orders;
create policy orders_select_own
on orders.orders for select
using (
  exists (
    select 1 from public.users u
    where u.id = orders.user_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists orders_insert_own on orders.orders;
create policy orders_insert_own
on orders.orders for insert
with check (
  exists (
    select 1 from public.users u
    where u.id = orders.user_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists orders_manage_logistics on orders.orders;
create policy orders_manage_logistics
on orders.orders for all
using (public.current_user_has_role(array['trabajador_logistico', 'admin']))
with check (public.current_user_has_role(array['trabajador_logistico', 'admin']));

drop policy if exists order_items_select_own on orders.order_items;
create policy order_items_select_own
on orders.order_items for select
using (
  exists (
    select 1
    from orders.orders o
    join public.users u on u.id = o.user_id
    where o.id = order_items.order_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists order_items_insert_own on orders.order_items;
create policy order_items_insert_own
on orders.order_items for insert
with check (
  exists (
    select 1
    from orders.orders o
    join public.users u on u.id = o.user_id
    where o.id = order_items.order_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists order_items_manage_logistics on orders.order_items;
create policy order_items_manage_logistics
on orders.order_items for all
using (public.current_user_has_role(array['trabajador_logistico', 'admin']))
with check (public.current_user_has_role(array['trabajador_logistico', 'admin']));

drop policy if exists shipments_select_own on shipping.shipments;
create policy shipments_select_own
on shipping.shipments for select
using (
  exists (
    select 1
    from orders.orders o
    join public.users u on u.id = o.user_id
    where o.id = shipments.order_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists shipments_manage_logistics on shipping.shipments;
create policy shipments_manage_logistics
on shipping.shipments for all
using (public.current_user_has_role(array['trabajador_logistico', 'admin']))
with check (public.current_user_has_role(array['trabajador_logistico', 'admin']));

drop policy if exists shipment_events_select_own on shipping.shipment_events;
create policy shipment_events_select_own
on shipping.shipment_events for select
using (
  exists (
    select 1
    from shipping.shipments s
    join orders.orders o on o.id = s.order_id
    join public.users u on u.id = o.user_id
    where s.id = shipment_events.shipment_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists shipment_events_manage_logistics on shipping.shipment_events;
create policy shipment_events_manage_logistics
on shipping.shipment_events for all
using (public.current_user_has_role(array['trabajador_logistico', 'admin']))
with check (public.current_user_has_role(array['trabajador_logistico', 'admin']));

drop policy if exists coupons_read_active on orders.coupons;
create policy coupons_read_active
on orders.coupons for select
using (is_active = true and (valid_until is null or valid_until >= current_date));

grant usage on schema inventory, orders, shipping to anon, authenticated, service_role;
grant select on all tables in schema inventory, orders, shipping to anon, authenticated;
grant select, insert, update, delete on all tables in schema inventory, orders, shipping to service_role;
grant select, insert, update on public.users to authenticated, service_role;
grant select on public.roles, public.user_roles to authenticated, service_role;

commit;
