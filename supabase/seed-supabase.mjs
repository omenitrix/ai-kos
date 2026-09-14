import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fvbejvfgmdhrycrfjrwo.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YmVqdmZnbWRocnljcmZqcndvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM2MTI0MCwiZXhwIjoyMTA0OTM3MjQwfQ.B6Ah0KJBCaLwWZTjeH7mP7H9zEozOjXbQ8afE_RwzPM";
const sb = createClient(url, key, { auth:{persistSession:false}});
async function main(){
  const pwAdmin = await bcrypt.hash("admin123",10);
  const pwOwner = await bcrypt.hash("owner123",10);
  const pwMember = await bcrypt.hash("member123",10);
  // cleanup FK-safe
  await sb.from("marketplace_orders").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("payments").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("bookings").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("chat_messages").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("chat_threads").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("kamars").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("promos").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("marketplace_services").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("kos_listings").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("verifications").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("admin_logs").delete().neq("id","00000000-0000-0000-0000-000000000000");
  await sb.from("users").delete().in("email",["admin@ai-kos.test","owner@ai-kos.test","member@ai-kos.test","guest@ai-kos.test","admin@aiman.test","owner@aiman.test","member@aiman.test","guest@aiman.test"]);

  const {data: admin} = await sb.from("users").insert({email:"admin@ai-kos.test", username:"admin", name:"Admin AI-KOS", role:"ADMIN", isVerified:true, passwordHash:pwAdmin}).select().single();
  const {data: owner} = await sb.from("users").insert({email:"owner@ai-kos.test", username:"owner", name:"Pak Budi Owner", phone:"081234567890", role:"OWNER", isVerified:true, passwordHash:pwOwner}).select().single();
  const {data: member} = await sb.from("users").insert({email:"member@ai-kos.test", username:"member", name:"Budi Member", phone:"081234567891", role:"MEMBER", isVerified:true, passwordHash:pwMember}).select().single();
  const {data: guest} = await sb.from("users").insert({email:"guest@ai-kos.test", username:"guest", name:"Guest User", role:"GUEST", isVerified:true, passwordHash:pwMember}).select().single();
  console.log("users", admin.email, owner.email, member.email, guest.email);

  const {data: kos1} = await sb.from("kos_listings").insert({ownerId:owner.id, nama:"Kos Aman Sentosa", slug:"kos-aman-sentosa-seed", alamat:"Jl. Merdeka No.10, Jakarta Selatan", deskripsi:"Kos nyaman dekat kampus, AC, WiFi, dapur bersama.", latitude:-6.2626, longitude:106.8244, fotoSampul:"https://picsum.photos/seed/kos1/800/450", fotoList:["https://picsum.photos/seed/kos1a/600/400","https://picsum.photos/seed/kos1b/600/400"], status:"AKTIF", isFeatured:true, genderType:"CAMPUR"}).select().single();
  const {data: kos2} = await sb.from("kos_listings").insert({ownerId:owner.id, nama:"Kos Elite Cempaka", slug:"kos-elite-cempaka-seed", alamat:"Jl. Cempaka No.5, Bandung", deskripsi:"Kos eksklusif full furnished.", latitude:-6.9, longitude:107.6, fotoSampul:"https://picsum.photos/seed/kos2/800/450", status:"AKTIF", genderType:"PUTRI"}).select().single();
  console.log("kos", kos1.slug, kos2.slug);

  const {data: kamars, error: kamarErr} = await sb.from("kamars").insert([
    {kosId:kos1.id, nomor:"A-01", tipe:"Kost Campur", luasM2:12, furnished:true, ac:true, wifi:true, dapur:true, laundry:true, parkiran:true, kamarMandiDalam:true, hargaBulanan:1500000, hargaTahunan:16500000, deposit:500000, tersedia:true},
    {kosId:kos1.id, nomor:"A-02", tipe:"Kost Campur", luasM2:12, furnished:true, ac:true, wifi:true, dapur:true, laundry:true, parkiran:true, kamarMandiDalam:true, hargaBulanan:1500000, deposit:500000, tersedia:true},
    {kosId:kos1.id, nomor:"B-01", tipe:"Kost Putri", luasM2:15, furnished:false, ac:false, wifi:true, dapur:true, laundry:false, parkiran:false, kamarMandiDalam:true, hargaBulanan:1200000, deposit:300000, tersedia:true},
    {kosId:kos2.id, nomor:"C-01", tipe:"Kost Putri", luasM2:14, furnished:true, ac:true, wifi:true, dapur:false, laundry:false, parkiran:false, kamarMandiDalam:true, hargaBulanan:2200000, deposit:800000, tersedia:true},
  ]).select();
  if(kamarErr){ console.error("kamarErr",kamarErr); throw kamarErr; }
  console.log("kamar", kamars?.length);

  await sb.from("promos").insert({kosId:kos1.id, kode:"FLASH50", diskonPersen:20, masaBerlakuAwal:new Date().toISOString(), masaBerlakuAkhir:new Date(Date.now()+7*24*3600*1000).toISOString(), isFlashSale:true});
  await sb.from("marketplace_services").insert([
    {kosId:kos1.id, nama:"Jasa Cleaning Kamar", deskripsi:"Bersihkan kamar kos per kunjungan", harga:50000, kategori:"CLEANING"},
    {kosId:kos1.id, nama:"Paket Internet 50Mbps", deskripsi:"Unlimited bulanan", harga:250000, kategori:"INTERNET"},
    {kosId:null, nama:"Set Meja Belajar", deskripsi:"Furniture untuk kos", harga:750000, kategori:"FURNITURE"},
  ]);
  const a01 = kamars.find(k=>k.nomor==="A-01");
  await sb.from("bookings").insert({kosId:kos1.id, kamarId:a01.id, penyewaId:member.id, tglMulai:new Date().toISOString(), durasiBulan:1, totalHarga:a01.hargaBulanan, status:"DRAFT"});
  const counts = {
    users: (await sb.from("users").select("id",{count:"exact",head:true})).count,
    kos: (await sb.from("kos_listings").select("id",{count:"exact",head:true})).count,
    kamar: (await sb.from("kamars").select("id",{count:"exact",head:true})).count,
  };
  console.log("COUNTS", counts);
}
main().catch(e=>{console.error(e);process.exit(1)})
