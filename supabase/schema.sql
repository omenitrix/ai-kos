-- AI-KOS Supabase schema — mirror prisma/schema.prisma (full native)
-- Jalankan di Supabase Dashboard → SQL Editor → New query → Paste → Run
-- Project: https://fvbejvfgmdhrycrfjrwo.supabase.co

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin create type "Role" as enum ('GUEST','MEMBER','OWNER','ADMIN'); exception when duplicate_object then null; end $$;
do $$ begin create type "KosStatus" as enum ('AKTIF','NONAKTIF','PENDING_APPROVAL'); exception when duplicate_object then null; end $$;
do $$ begin create type "BookingStatus" as enum ('DRAFT','PENDING_PAYMENT','ACTIVE','SELESAI','DIBATALKAN'); exception when duplicate_object then null; end $$;
do $$ begin create type "PaymentMethod" as enum ('TRANSFER_BANK','E_WALLET','QRIS','VIRTUAL_ACCOUNT'); exception when duplicate_object then null; end $$;
do $$ begin create type "PaymentStatus" as enum ('PENDING','SUCCESS','FAILED','REFUNDED'); exception when duplicate_object then null; end $$;
do $$ begin create type "MarketplaceCategory" as enum ('FURNITURE','CLEANING','LAUNDRY','TEKNISI','INTERNET','CATERING','LAINNYA'); exception when duplicate_object then null; end $$;
do $$ begin create type "VerificationType" as enum ('KTP','SELFIE','EMAIL','PHONE'); exception when duplicate_object then null; end $$;
do $$ begin create type "VerificationStatus" as enum ('PENDING','APPROVED','REJECTED'); exception when duplicate_object then null; end $$;
do $$ begin create type "MarketplaceOrderStatus" as enum ('PENDING','CONFIRMED','PROCESSING','COMPLETED','CANCELLED','REFUNDED'); exception when duplicate_object then null; end $$;

-- Users (custom auth, tetap pakai bcrypt — Supabase Auth tidak dipakai dulu biar next-auth tetap jalan)
create table if not exists users (
  id text primary key default gen_random_uuid()::text,
  name text,
  username text unique,
  email text unique not null,
  "emailVerified" timestamp with time zone,
  "passwordHash" text,
  phone text,
  photo text,
  role "Role" not null default 'GUEST',
  "isVerified" boolean not null default false,
  "otpCode" text,
  "otpExpiry" timestamp with time zone,
  "isSuspended" boolean not null default false,
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now()
);

create table if not exists kos_listings (
  id text primary key default gen_random_uuid()::text,
  "ownerId" text not null references users(id) on delete cascade,
  nama text not null,
  slug text unique not null,
  deskripsi text,
  alamat text not null,
  latitude double precision,
  longitude double precision,
  "fotoSampul" text,
  "fotoList" text[] not null default '{}',
  video text,
  status "KosStatus" not null default 'PENDING_APPROVAL',
  "isFeatured" boolean not null default false,
  "genderType" text default 'CAMPUR',
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now()
);

create table if not exists kamars (
  id text primary key default gen_random_uuid()::text,
  "kosId" text not null references kos_listings(id) on delete cascade,
  nomor text,
  tipe text,
  "luasM2" integer,
  furnished boolean not null default false,
  ac boolean not null default false,
  wifi boolean not null default false,
  dapur boolean not null default false,
  laundry boolean not null default false,
  parkiran boolean not null default false,
  "kamarMandiDalam" boolean not null default true,
  "hargaBulanan" integer not null,
  "hargaTahunan" integer,
  deposit integer not null default 0,
  tersedia boolean not null default true,
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now()
);

create table if not exists bookings (
  id text primary key default gen_random_uuid()::text,
  "kosId" text not null references kos_listings(id),
  "kamarId" text not null references kamars(id),
  "penyewaId" text not null references users(id),
  "tglMulai" timestamp with time zone not null,
  "tglSelesai" timestamp with time zone,
  "durasiBulan" integer not null default 1,
  status "BookingStatus" not null default 'DRAFT',
  "totalHarga" integer not null,
  "isBlacklisted" boolean not null default false,
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now()
);

create table if not exists payments (
  id text primary key default gen_random_uuid()::text,
  "bookingId" text not null references bookings(id),
  "payerId" text not null references users(id),
  amount integer not null,
  method "PaymentMethod" not null default 'VIRTUAL_ACCOUNT',
  status "PaymentStatus" not null default 'PENDING',
  "invoiceNo" text unique,
  "buktiBayar" text,
  "verifiedAt" timestamp with time zone,
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now()
);

create table if not exists promos (
  id text primary key default gen_random_uuid()::text,
  "kosId" text not null references kos_listings(id) on delete cascade,
  kode text unique not null,
  deskripsi text,
  "diskonPersen" integer,
  "diskonNominal" integer,
  "masaBerlakuAwal" timestamp with time zone not null,
  "masaBerlakuAkhir" timestamp with time zone not null,
  "isActive" boolean not null default true,
  "isFlashSale" boolean not null default false,
  "createdAt" timestamp with time zone not null default now()
);

create table if not exists marketplace_services (
  id text primary key default gen_random_uuid()::text,
  "kosId" text references kos_listings(id),
  nama text not null,
  deskripsi text,
  harga integer not null,
  stok integer,
  foto text,
  kategori "MarketplaceCategory" not null default 'LAINNYA',
  "isActive" boolean not null default true,
  "createdAt" timestamp with time zone not null default now()
);

create table if not exists marketplace_orders (
  id text primary key default gen_random_uuid()::text,
  "serviceId" text not null references marketplace_services(id),
  "buyerId" text not null references users(id),
  qty integer not null default 1,
  "totalHarga" integer not null,
  status "MarketplaceOrderStatus" not null default 'PENDING',
  catatan text,
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now()
);

create table if not exists verifications (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references users(id),
  type "VerificationType" not null,
  status "VerificationStatus" not null default 'PENDING',
  "fileUrl" text,
  nota text,
  "reviewedAt" timestamp with time zone,
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now()
);

create table if not exists chat_threads (
  id text primary key default gen_random_uuid()::text,
  "kosId" text not null references kos_listings(id),
  "memberId" text not null,
  "ownerId" text not null,
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now()
);

create table if not exists chat_messages (
  id text primary key default gen_random_uuid()::text,
  "threadId" text not null references chat_threads(id) on delete cascade,
  "senderId" text not null references users(id),
  content text not null,
  "isRead" boolean not null default false,
  "createdAt" timestamp with time zone not null default now()
);

create table if not exists admin_logs (
  id text primary key default gen_random_uuid()::text,
  "adminId" text not null references users(id),
  action text not null,
  "targetId" text,
  "targetType" text,
  keterangan text,
  "createdAt" timestamp with time zone not null default now()
);

-- UpdatedAt trigger
create or replace function set_updated_at() returns trigger as $$ begin new."updatedAt" = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_users_updated on users; create trigger trg_users_updated before update on users for each row execute function set_updated_at();
drop trigger if exists trg_kos_updated on kos_listings; create trigger trg_kos_updated before update on kos_listings for each row execute function set_updated_at();
drop trigger if exists trg_kamar_updated on kamars; create trigger trg_kamar_updated before update on kamars for each row execute function set_updated_at();
drop trigger if exists trg_booking_updated on bookings; create trigger trg_booking_updated before update on bookings for each row execute function set_updated_at();
drop trigger if exists trg_payment_updated on payments; create trigger trg_payment_updated before update on payments for each row execute function set_updated_at();
drop trigger if exists trg_order_updated on marketplace_orders; create trigger trg_order_updated before update on marketplace_orders for each row execute function set_updated_at();
drop trigger if exists trg_verif_updated on verifications; create trigger trg_verif_updated before update on verifications for each row execute function set_updated_at();
drop trigger if exists trg_thread_updated on chat_threads; create trigger trg_thread_updated before update on chat_threads for each row execute function set_updated_at();

-- RLS: matikan dulu biar service_role bebas (nanti bisa diaktifkan pelan-pelan)
alter table users disable row level security;
alter table kos_listings disable row level security;
alter table kamars disable row level security;
alter table bookings disable row level security;
alter table payments disable row level security;
alter table promos disable row level security;
alter table marketplace_services disable row level security;
alter table marketplace_orders disable row level security;
alter table verifications disable row level security;
alter table chat_threads disable row level security;
alter table chat_messages disable row level security;
alter table admin_logs disable row level security;

-- Storage buckets (jalankan sekali)
insert into storage.buckets (id, name, public) values ('kos-foto','kos-foto', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('kamar-foto','kamar-foto', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('verifikasi','verifikasi', false) on conflict (id) do nothing;
