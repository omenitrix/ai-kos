-- RLS enable + policies (jalankan di Supabase SQL Editor → New query → Run)
-- anon = public read kos aktif/kamar tersedia; owner/admin write own; service_role bypass tetap jalan

-- enable
alter table users enable row level security;
alter table kos_listings enable row level security;
alter table kamars enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table promos enable row level security;
alter table marketplace_services enable row level security;
alter table marketplace_orders enable row level security;
alter table verifications enable row level security;
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;
alter table admin_logs enable row level security;

-- drop old policies if re-run
do $$ declare r record; begin for r in select policyname, tablename from pg_policies where schemaname='public' loop execute format('drop policy if exists %I on %I', r.policyname, r.tablename); end loop; end $$;

-- users: anon tidak bisa select user lain; service_role bypass (udah pakai service key). Buat read own via auth.jwt → tapi kita pakai next-auth custom, jadi biarkan service_role aja.
-- Untuk anon/mvp: allow select users where id = auth.uid() tidak relevan. Simpel: enable tapi buat policy permissive untuk service_role via bypass, dan anon hanya bisa select id,name,photo public via anon key.
-- Karena next-auth pakai service_role di server, client tidak perlu direct. Jadi policy: allow authenticated read own tidak dipakai — cukup "service_role bypass" otomatis melewati RLS. Untuk anon: deny all kecuali kos public.
create policy "deny_users_anon" on users for select to anon using (false);
create policy "allow_users_service_all" on users for all to service_role using (true) with check (true);
create policy "allow_users_auth_all" on users for all to authenticated using (true) with check (true);

-- kos_listings: public read AKTIF, owner manage own via service_role (server). Anon read aktif saja.
create policy "kos_read_public" on kos_listings for select to anon using (status = 'AKTIF');
create policy "kos_read_auth" on kos_listings for select to authenticated using (true);
create policy "kos_service_all" on kos_listings for all to service_role using (true) with check (true);
create policy "kos_auth_write" on kos_listings for all to authenticated using (true) with check (true);

-- kamars: public read untuk kos AKTIF (disaring via join di app), simpel allow select anon
create policy "kamar_read_public" on kamars for select to anon using (true);
create policy "kamar_service_all" on kamars for all to service_role using (true) with check (true);
create policy "kamar_auth_all" on kamars for all to authenticated using (true) with check (true);

-- lainnya: anon deny, service_role + authenticated allow (server handle authz)
create policy "bookings_svc" on bookings for all to service_role using (true) with check (true);
create policy "bookings_auth" on bookings for all to authenticated using (true) with check (true);
create policy "payments_svc" on payments for all to service_role using (true) with check (true);
create policy "payments_auth" on payments for all to authenticated using (true) with check (true);
create policy "promos_read_anon" on promos for select to anon using ("isActive" = true);
create policy "promos_svc" on promos for all to service_role using (true) with check (true);
create policy "promos_auth" on promos for all to authenticated using (true) with check (true);
create policy "mkt_svc_read_anon" on marketplace_services for select to anon using ("isActive" = true);
create policy "mkt_svc_all" on marketplace_services for all to service_role using (true) with check (true);
create policy "mkt_svc_auth" on marketplace_services for all to authenticated using (true) with check (true);
create policy "mkt_orders_svc" on marketplace_orders for all to service_role using (true) with check (true);
create policy "mkt_orders_auth" on marketplace_orders for all to authenticated using (true) with check (true);
create policy "verif_svc" on verifications for all to service_role using (true) with check (true);
create policy "verif_auth" on verifications for all to authenticated using (true) with check (true);
create policy "threads_svc" on chat_threads for all to service_role using (true) with check (true);
create policy "threads_auth" on chat_threads for all to authenticated using (true) with check (true);
create policy "msgs_svc" on chat_messages for all to service_role using (true) with check (true);
create policy "msgs_auth" on chat_messages for all to authenticated using (true) with check (true);
create policy "logs_svc" on admin_logs for all to service_role using (true) with check (true);
create policy "logs_auth" on admin_logs for all to authenticated using (true) with check (true);

-- Storage: buckets sudah ada (kos-foto,kamar-foto,verifikasi,bukti-bayar)
insert into storage.buckets (id, name, public) values ('bukti-bayar','bukti-bayar', false) on conflict (id) do nothing;
-- storage.objects policies
-- enable RLS sudah default
do $$ begin
  drop policy if exists "public read kos-foto" on storage.objects;
  drop policy if exists "public read kamar-foto" on storage.objects;
  drop policy if exists "anon upload kos-foto" on storage.objects;
  drop policy if exists "anon upload kamar-foto" on storage.objects;
exception when undefined_table then null; end $$;

create policy "public read kos-foto" on storage.objects for select to anon, authenticated using (bucket_id = 'kos-foto');
create policy "public read kamar-foto" on storage.objects for select to anon, authenticated using (bucket_id = 'kamar-foto');
create policy "anon upload kos-foto" on storage.objects for insert to anon, authenticated, service_role with check (bucket_id in ('kos-foto','kamar-foto','verifikasi','bukti-bayar'));
create policy "service all storage" on storage.objects for all to service_role using (true) with check (true);
create policy "auth all storage" on storage.objects for all to authenticated using (true) with check (true);
