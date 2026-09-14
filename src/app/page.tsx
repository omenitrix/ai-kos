"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/magic/shimmer-button";
import { BeamHero } from "@/components/magic/border-beam";
import { BentoKosGrid } from "@/components/magic/bento-grid";

const dummyKos = [
  { slug: "kos-aman-sentosa", nama: "Kos Aman Sentosa", alamat: "Merdeka No.10 — Jakarta Selatan", harga: 1500000, foto: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80&auto=format&fit=crop", badge: "Featured" },
  { slug: "kos-aman-elite", nama: "Kos Elite Cempaka", alamat: "Cempaka No.5 — Bandung", harga: 2200000, foto: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80&auto=format&fit=crop", badge: "Luxury" },
  { slug: "kos-aman-mahasiswa", nama: "Kos Mahasiswa Ceria", alamat: "Kampus No.3 — Yogyakarta", harga: 900000, foto: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80&auto=format&fit=crop", badge: "Value" },
];

function IconSearch(props:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20L15 15"/></svg>}
function IconShield(props:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z"/><path d="M9 12l2 2 4-4"/></svg>}
function IconSparkle(props:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 17l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><path d="M19 14l1 1.5 1.5 1-1.5 1L19 19l-1-1.5L16.5 16l1.5-1z"/></svg>}
function IconChat(props:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H8l-4 4v-12A8.5 8.5 0 0 1 12.5 3.5z"/><path d="M8 10h8M8 14h5"/></svg>}

export default function HomePage() {
  return (
    <div className="bg-[#FDFBF7]">
      {/* HERO — Luxury Minimal + Motion */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7] via-[#F9F3E8] to-[#FDFBF7]" />
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.8}} className="absolute -top-24 -right-24 h-[520px] w-[520px] rounded-full bg-[#C9A96A]/10 blur-3xl" />
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.8, delay:0.2}} className="absolute -bottom-32 -left-32 h-[480px] w-[480px] rounded-full bg-[#E8DCC8]/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-16 grid md:grid-cols-[1.05fr_0.95fr] gap-8 md:gap-10 items-center">
          <motion.div initial={{opacity:0, y:16}} animate={{opacity:1, y:0}} transition={{duration:0.6, ease:[0.16,1,0.3,1]}} className="space-y-5">
            <Badge className="bg-white animate-in">AI-KOS • EST. 2026 — Luxury Living</Badge>
            <h1 className="font-serif text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.02em] text-[#1C1610]">
              Hunian kos
              <span className="block font-light italic text-[#C9A96A]">elegan &amp; cerdas</span>
              <span className="block">untuk hidup modern.</span>
            </h1>
            <p className="max-w-[520px] text-[15px] leading-relaxed text-[#6B5E4F]">
              AI-KOS memadukan hospitality premium dengan teknologi AI — cari, kelola, dan sewa kos dalam satu platform yang tenang, minimal, dan profesional.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/kos/cari"><ShimmerButton>Cari Kos Sekarang →</ShimmerButton></Link>
              <Link href="/register"><Button variant="outline" size="lg" className="rounded-full">Jadi Owner Kos</Button></Link>
            </div>
            <div className="flex flex-wrap gap-3 pt-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8DCC8] bg-white px-3 py-1.5 text-[#5C5448] shadow-soft"><IconSearch className="h-3.5 w-3.5 text-[#C9A96A]"/> Smart Search AI</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8DCC8] bg-white px-3 py-1.5 text-[#5C5448] shadow-soft"><IconChat className="h-3.5 w-3.5 text-[#C9A96A]"/> Chat Owner</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8DCC8] bg-white px-3 py-1.5 text-[#5C5448] shadow-soft"><IconShield className="h-3.5 w-3.5 text-[#C9A96A]"/> QRIS / VA</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i=><Image key={i} src={`https://i.pravatar.cc/100?img=${10+i}`} alt="" width={28} height={28} className="h-7 w-7 rounded-full border-2 border-white object-cover"/>)}
              </div>
              <span className="text-xs text-[#8A7D6B]">Dipercaya 2.000+ penyewa • Rating 4.9/5 di Jabodetabek</span>
            </div>
          </motion.div>

          <motion.div initial={{opacity:0, y:20, scale:0.98}} animate={{opacity:1, y:0, scale:1}} transition={{duration:0.7, delay:0.15, ease:[0.16,1,0.3,1]}} className="relative">
            <BeamHero className="mx-auto max-w-[420px] p-3 shadow-soft-lg">
              <div className="rounded-[20px] overflow-hidden border border-[#F0EAD8] bg-[#FDFBF7]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0EAD8] bg-white">
                  <span className="font-serif text-sm font-semibold text-[#2C2416]">AI-KOS Dashboard</span>
                  <span className="h-2 w-2 rounded-full bg-[#C9A96A] animate-pulse" />
                </div>
                <div className="relative h-[220px] w-full">
                  <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop" alt="Interior kos realistic" fill className="object-cover" sizes="(max-width: 768px) 100vw, 420px" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#2C2416]">Kos Aman Sentosa</span>
                    <span className="rounded-full bg-[#C9A96A] px-2.5 py-1 text-[11px] font-semibold text-white">Featured</span>
                  </div>
                  <p className="text-xs text-[#8A7D6B]">Jl. Merdeka No.10 — Jakarta • 3 kamar tersedia • AI score 92%</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white border border-[#EDE6D6] p-2"><div className="text-[11px] tracking-widest uppercase text-[#B8A99A]">Terisi</div><div className="font-serif text-sm font-bold text-[#2C2416]">78%</div></div>
                    <div className="rounded-xl bg-white border border-[#EDE6D6] p-2"><div className="text-[11px] tracking-widest uppercase text-[#B8A99A]">Rating</div><div className="font-serif text-sm font-bold text-[#2C2416]">4.9</div></div>
                    <div className="rounded-xl bg-[#2C2416] p-2 text-white"><div className="text-[11px] tracking-widest uppercase text-[#C9A96A]">Mulai</div><div className="text-sm font-bold">1.5jt</div></div>
                  </div>
                </div>
              </div>
            </BeamHero>
            <motion.div initial={{opacity:0, x:-12}} animate={{opacity:1, x:0}} transition={{delay:0.6, duration:0.5}} className="absolute -left-4 top-10 hidden md:flex items-center gap-2 rounded-full border border-[#EDE6D6] bg-white px-3 py-2 shadow-soft text-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F0E8]"><IconSparkle className="h-3.5 w-3.5 text-[#C9A96A]"/></span>
              <span className="font-medium text-[#2C2416]">AI Rekomendasi</span><span className="text-[#8A7D6B]">3 terpilih untukmu</span>
            </motion.div>
            <motion.div initial={{opacity:0, x:12}} animate={{opacity:1, x:0}} transition={{delay:0.7, duration:0.5}} className="absolute -right-3 bottom-8 hidden md:flex items-center gap-2 rounded-2xl border border-[#EDE6D6] bg-white px-3 py-2.5 shadow-soft">
              <Image src="https://i.pravatar.cc/100?img=16" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover"/>
              <div className="text-xs"><div className="font-medium text-[#2C2416]">Pak Budi • Owner</div><div className="text-[#8A7D6B]">Membalas dalam 2 menit</div></div>
            </motion.div>
            <p className="mt-3 text-center text-[11px] tracking-widest uppercase text-[#B8A99A]">Mockup device • Real dashboard preview • Foto realistic profesional</p>
          </motion.div>
        </div>
      </section>

      {/* Kos Featured — Bento Grid + Motion */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#C9A96A]">Koleksi Terkurasi</p>
            <h2 className="font-serif text-[26px] md:text-[30px] font-semibold tracking-tight text-[#1C1610]">Kos Featured Pilihan</h2>
            <p className="text-sm text-[#8A7D6B]">Hunian terverifikasi • Foto realistic • Bento luxury motion</p>
          </div>
          <Link href="/kos/cari" className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#E8DCC8] bg-white px-4 py-2 text-sm font-medium text-[#2C2416] hover:border-[#C9A96A]">Lihat semua <span aria-hidden>→</span></Link>
        </div>
        <BentoKosGrid items={dummyKos} />
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-[#EDE6D6]">
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["500+", "Kos Terverifikasi", "Foto realistic profesional"],
            ["2.000+", "Penyewa Aktif", "Trust & aman"],
            ["AI", "Rekomendasi Cerdas", "Budget & lokasi"],
            ["24/7", "Concierge", "Chat & support"],
          ].map(([v, l, sub], i) => (
            <motion.div key={l} initial={{opacity:0, y:12}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:i*0.08}} className="rounded-2xl border border-[#EDE6D6] bg-[#FDFBF7] p-5 text-center shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all">
              <div className="font-serif text-[22px] font-bold text-[#1C1610]">{v}</div>
              <div className="text-xs font-semibold tracking-wide text-[#2C2416]">{l}</div>
              <div className="text-[11px] text-[#8A7D6B]">{sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Alur */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#C9A96A]">Alur Penyewa</p>
        <h2 className="font-serif text-[26px] font-semibold tracking-tight text-[#1C1610]">Dari cari sampai huni — 6 langkah elegan</h2>
        <ol className="mt-6 grid md:grid-cols-6 gap-3">
          {[
            ["Cari Kos", IconSearch, "Filter & maps AI"],
            ["Lihat Detail", IconShield, "Foto realistic"],
            ["Chat Owner", IconChat, "Balasan cepat"],
            ["Booking", IconSparkle, "Amankan kamar"],
            ["Bayar", IconShield, "QRIS / VA / e-wallet"],
            ["Huni", IconSparkle, "Penyewa aktif"],
          ].map(([label, Icon, sub], i) => (
            <motion.li key={String(label)} initial={{opacity:0, y:12}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:i*0.06}} whileHover={{y:-3}} className="rounded-2xl border border-[#EDE6D6] bg-white p-4 text-center shadow-soft hover:shadow-gold transition-all">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F0E8] border border-[#EDE6D6] text-[#C9A96A]"><Icon className="h-5 w-5"/></div>
              <div className="text-xs font-semibold text-[#2C2416]">{label as string}</div>
              <div className="text-[11px] text-[#8A7D6B]">{sub as string}</div>
              <div className="mt-2 text-[10px] tracking-widest uppercase text-[#B8A99A]">0{i+1}</div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-[24px] bg-gradient-to-br from-[#1C1610] to-[#2C2416] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-soft-lg border border-[#3A2E1E]">
          <div>
            <p className="font-serif text-xl text-white">Siap kelola kos dengan standar luxury?</p>
            <p className="text-sm text-[#C9A96A]">Owner & penyewa dalam satu platform — minimal, aman, profesional.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/register"><ShimmerButton>Mulai Gratis</ShimmerButton></Link>
            <Link href="/ai" className="inline-flex h-11 items-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-medium text-white hover:bg-white/15 transition-colors">Tanya AI Concierge</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
