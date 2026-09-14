import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const pwAdmin = await bcrypt.hash("admin123", 10);
  const pwOwner = await bcrypt.hash("owner123", 10);
  const pwMember = await bcrypt.hash("member123", 10);

  // cleanup previous seed (idempotent) — order FK-safe
  await prisma.marketplaceOrder.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatThread.deleteMany({});
  await prisma.kamar.deleteMany({});
  await prisma.promo.deleteMany({});
  await prisma.marketplaceService.deleteMany({});
  await prisma.kosListing.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.adminLog.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { in: ["admin@ai-kos.test","owner@ai-kos.test","member@ai-kos.test","guest@ai-kos.test","admin@aiman.test","owner@aiman.test","member@aiman.test","guest@aiman.test"] } } });

  const admin = await prisma.user.create({ data: { email:"admin@ai-kos.test", username:"admin", name:"Admin AI-KOS", role:"ADMIN", isVerified:true, passwordHash: pwAdmin } });
  const owner = await prisma.user.create({ data: { email:"owner@ai-kos.test", username:"owner", name:"Pak Budi Owner", phone:"081234567890", role:"OWNER", isVerified:true, passwordHash: pwOwner } });
  const member = await prisma.user.create({ data: { email:"member@ai-kos.test", username:"member", name:"Budi Member", phone:"081234567891", role:"MEMBER", isVerified:true, passwordHash: pwMember } });
  const guest = await prisma.user.create({ data: { email:"guest@ai-kos.test", username:"guest", name:"Guest User", role:"GUEST", isVerified:true, passwordHash: pwMember } });
  console.log("users:", admin.email, owner.email, member.email, guest.email);

  const kos1 = await prisma.kosListing.create({
    data: {
      ownerId: owner.id, nama:"Kos Aman Sentosa", slug:"kos-aman-sentosa-seed", alamat:"Jl. Merdeka No.10, Jakarta Selatan",
      deskripsi:"Kos nyaman dekat kampus, AC, WiFi, dapur bersama. Cocok untuk pekerja & mahasiswa.", latitude:-6.2626, longitude:106.8244,
      fotoSampul:"https://picsum.photos/seed/kos1/800/450", fotoList:["https://picsum.photos/seed/kos1a/600/400","https://picsum.photos/seed/kos1b/600/400"],
      status:"AKTIF", isFeatured:true, genderType:"CAMPUR",
      kamar: { create: [
        { nomor:"A-01", tipe:"Kost Campur", luasM2:12, furnished:true, ac:true, wifi:true, dapur:true, laundry:true, parkiran:true, kamarMandiDalam:true, hargaBulanan:1500000, hargaTahunan:16500000, deposit:500000, tersedia:true },
        { nomor:"A-02", tipe:"Kost Campur", luasM2:12, furnished:true, ac:true, wifi:true, dapur:true, laundry:true, parkiran:true, kamarMandiDalam:true, hargaBulanan:1500000, deposit:500000, tersedia:true },
        { nomor:"B-01", tipe:"Kost Putri", luasM2:15, furnished:false, ac:false, wifi:true, dapur:true, laundry:false, kamarMandiDalam:true, hargaBulanan:1200000, deposit:300000, tersedia:true },
      ]},
    }, include:{kamar:true}
  });
  const kos2 = await prisma.kosListing.create({
    data: {
      ownerId: owner.id, nama:"Kos Elite Cempaka", slug:"kos-elite-cempaka-seed", alamat:"Jl. Cempaka No.5, Bandung",
      deskripsi:"Kos eksklusif full furnished, dekat pusat komersial.", latitude:-6.9, longitude:107.6,
      fotoSampul:"https://picsum.photos/seed/kos2/800/450", status:"AKTIF", genderType:"PUTRI",
      kamar: { create: [
        { nomor:"C-01", tipe:"Kost Putri", luasM2:14, furnished:true, ac:true, wifi:true, hargaBulanan:2200000, deposit:800000, tersedia:true },
      ]},
    }, include:{kamar:true}
  });
  console.log("kos:", kos1.slug, kos2.slug, "kamar total", kos1.kamar.length + kos2.kamar.length);

  await prisma.promo.create({ data:{ kosId:kos1.id, kode:"FLASH50", diskonPersen:20, masaBerlakuAwal:new Date(), masaBerlakuAkhir:new Date(Date.now()+7*24*3600*1000), isFlashSale:true } });
  await prisma.marketplaceService.createMany({ data:[
    { kosId:kos1.id, nama:"Jasa Cleaning Kamar", deskripsi:"Bersihkan kamar kos per kunjungan", harga:50000, kategori:"CLEANING" },
    { kosId:kos1.id, nama:"Paket Internet 50Mbps", deskripsi:"Unlimited bulanan", harga:250000, kategori:"INTERNET" },
    { kosId:null, nama:"Set Meja Belajar", deskripsi:"Furniture untuk kos", harga:750000, kategori:"FURNITURE" },
  ]});

  // booking member -> kos1 A-01 (DRAFT)
  const kamarA01 = kos1.kamar[0];
  const booking = await prisma.booking.create({ data:{ kosId:kos1.id, kamarId:kamarA01.id, penyewaId:member.id, tglMulai:new Date(), durasiBulan:1, totalHarga:kamarA01.hargaBulanan, status:"DRAFT" } });
  console.log("booking DRAFT:", booking.id, "member->", member.email, "kamar", kamarA01.nomor);

  const counts = {
    users: await prisma.user.count(),
    kos: await prisma.kosListing.count(),
    kamar: await prisma.kamar.count(),
    bookings: await prisma.booking.count(),
    promos: await prisma.promo.count(),
    marketplace: await prisma.marketplaceService.count(),
  };
  console.log("COUNTS", counts);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
