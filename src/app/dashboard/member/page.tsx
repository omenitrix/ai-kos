"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function ISearch(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20L15 15"/></svg>}
function IWallet(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h4"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/></svg>}
function IBuilding(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>}
function ISparkle(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9z"/></svg>}

export default function MemberDashboard() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  useEffect(()=>{
    fetch("/api/penyewaan").then(r=>r.json()).then((d:any)=>{
      setBookings(Array.isArray(d)?d:d.data||[]);
    }).catch(()=>{});
  },[]);

  const activeBooking = bookings.find(b=>b.status==="ACTIVE"||b.status==="DRAFT");
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Member";

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="serif text-[26px] leading-none">Hai, {userName} <span className="text-[#C9A96A]">—</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">Kelola kos yang kamu sewa, tagihan, dan pesan jasa tambahan</p>
        </div>
        <div className="flex gap-2">
          <Link href="/kos/cari" className="rounded-full bg-[#1C1610] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#2C2416]"><ISearch className="inline h-3.5 w-3.5 mr-1.5"/> Cari Kos Baru</Link>
          <Link href="/marketplace" className="rounded-full bg-white border border-[#E8DCC8] px-5 py-2.5 text-sm font-medium hover:bg-[#FDFBF7]">Jasa & Laundry</Link>
        </div>
      </div>

      {/* KPI 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]"><IBuilding className="h-4 w-4"/></span><span className="text-[11px] tracking-widest uppercase text-[#2E7D32] bg-[#EAF6EC] border border-[#C8E6C9] rounded-full px-2 py-0.5">Aktif</span></div>
          <div className="serif text-[28px] leading-none mt-3">{bookings.length||1}</div>
          <div className="text-xs text-[#8A7D6B]">Kos Disewa</div>
          <div className="mt-2 h-1 rounded-full bg-[#F5F0E8]"><div className="h-1 rounded-full bg-[#C9A96A]" style={{width:"100%"}} /></div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]">◎</span><span className="text-xs font-semibold text-[#8A6D1E] bg-[#FFF3E0] border border-[#FFE0B2] rounded-full px-2 py-0.5">Jatuh Tempo</span></div>
          <div className="serif text-[26px] leading-none mt-3">10 <span className="text-sm font-sans font-normal text-[#8A7D6B]">Okt</span></div>
          <div className="text-xs text-[#8A7D6B]">Tagihan Berikutnya</div>
          <div className="mt-2 text-xs text-[#C9A96A] font-medium">Sisa 28 hari</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-4 text-white shadow-soft-lg">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-white/10 border border-white/15 grid place-items-center text-[#C9A96A]"><IWallet className="h-4 w-4"/></span><span className="text-[11px] tracking-widest uppercase text-[#E8DCC8]">Tagihan</span></div>
          <div className="serif text-[20px] mt-3">Rp 1,5<span className="text-sm font-sans font-normal"> jt/bln</span></div>
          <div className="text-xs text-[#E8DCC8]">Kamar A-01 Sentosa</div>
          <Link href="/dashboard/member/pembayaran" className="mt-2 inline-block text-xs text-[#C9A96A]">Bayar Sekarang →</Link>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A] text-sm">✦</span><span className="text-[11px] rounded-full bg-[#F5F0E8] border border-[#E8DCC8] px-2 py-0.5 text-[#8A7D6B]">Tier Gold</span></div>
          <div className="serif text-[28px] leading-none mt-3">250</div>
          <div className="text-xs text-[#8A7D6B]">Poin Loyalitas</div>
          <div className="mt-2 text-xs text-[#8A7D6B]">Bisa tukar kupon 50rb</div>
        </div>
      </div>

      {/* active sewa highlight card */}
      <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5F0E8] pb-4">
          <div>
            <span className="inline-block rounded-full bg-[#F5F0E8] border border-[#E8DCC8] px-3 py-0.5 text-[11px] font-semibold tracking-widest uppercase text-[#8A7D6B]">Kontrak Aktif</span>
            <h2 className="serif text-[22px] mt-1">Kos Aman Sentosa — Kamar A-01</h2>
            <p className="text-xs text-[#8A7D6B]">Jl. Boulevard Barat No. 8, Kelapa Gading, Jakarta Utara</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/member/penyewaan/aktif" className="rounded-full bg-[#1C1610] text-white px-4 py-2 text-xs font-medium">Detail Sewa</Link>
            <Link href="/kos/kos-aman-sentosa-seed/chat" className="rounded-full bg-white border border-[#E8DCC8] px-4 py-2 text-xs font-medium">Chat Owner</Link>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3"><div className="text-[#8A7D6B]">Tipe Kamar</div><div className="font-semibold text-sm mt-0.5">AC + KM Dalam</div></div>
          <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3"><div className="text-[#8A7D6B]">Harga Bulanan</div><div className="font-semibold text-sm mt-0.5">Rp 1.500.000</div></div>
          <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3"><div className="text-[#8A7D6B]">Mulai Sewa</div><div className="font-semibold text-sm mt-0.5">12 Sep 2026</div></div>
          <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3"><div className="text-[#8A7D6B]">Status Kontrak</div><div className="font-semibold text-sm mt-0.5 text-[#2E7D32]">Aktif (Auto-renew)</div></div>
        </div>
      </div>

      {/* 2 kolom: marketplace + AI helper */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="flex items-center justify-between"><div className="text-sm font-semibold">Layanan Tambahan Kos</div><Link href="/marketplace" className="text-xs font-medium text-[#C9A96A]">Buka Marketplace →</Link></div>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <Link href="/marketplace" className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 hover:border-[#C9A96A] transition-colors">
              <div className="text-xl">🧺</div>
              <div className="font-semibold text-xs mt-2">Laundry Express</div>
              <div className="text-[11px] text-[#8A7D6B]">Rp 10.000/kg</div>
            </Link>
            <Link href="/marketplace" className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 hover:border-[#C9A96A] transition-colors">
              <div className="text-xl">🧹</div>
              <div className="font-semibold text-xs mt-2">Cleaning Kamar</div>
              <div className="text-[11px] text-[#8A7D6B]">Rp 50.000/sesi</div>
            </Link>
            <Link href="/marketplace" className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 hover:border-[#C9A96A] transition-colors">
              <div className="text-xl">🍱</div>
              <div className="font-semibold text-xs mt-2">Catering Harian</div>
              <div className="text-[11px] text-[#8A7D6B]">Rp 25.000/porsi</div>
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-5 text-white shadow-soft-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium"><ISparkle className="h-4 w-4 text-[#C9A96A]"/> AI Concierge Penyewa</div>
            <p className="mt-2 text-xs leading-relaxed text-[#E8DCC8]">Butuh komplain AC, minta nota resmi, atau cari teman sekamar? AI Concierge bisa bantu susun pesan ke owner.</p>
          </div>
          <Link href="/ai" className="mt-4 inline-flex items-center justify-center rounded-full bg-[#C9A96A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B8944F]">Tanya AI Concierge</Link>
        </div>
      </div>
    </div>
  );
}
