"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// outline icons 1.6
function IBuilding(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>}
function IWallet(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h4"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/></svg>}
function ISparkle(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9z"/><path d="M19 14l1 1 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1z"/></svg>}

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ kos:2, kamar:4, terisi:1, kosong:3, pendapatan: 1500000, booking:1 });
  useEffect(()=>{
    fetch("/api/kos").then(r=>r.json()).then((d:any)=>{
      const arr = Array.isArray(d)?d:d.data||[];
      const kamar = arr.reduce((s:any,k:any)=>s+(k.kamar?.length||k._count?.kamar||0),0);
      setStats(s=>({...s, kos: arr.length||2, kamar: kamar||4 }));
    }).catch(()=>{});
    fetch("/api/penyewaan").then(r=>r.json()).then((d:any)=>{
      const arr = Array.isArray(d)?d:d.data||[];
      setStats(s=>({...s, booking: arr.length||1, terisi: arr.filter((b:any)=>b.status==="ACTIVE").length||1 }));
    }).catch(()=>{});
  },[]);
  const okupansi = stats.kamar ? Math.round((stats.terisi/stats.kamar)*100) : 25;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="serif text-[26px] leading-none">Selamat pagi, Owner <span className="text-[#C9A96A]">—</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">{stats.kos} kos • {stats.kamar} kamar • update real-time</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/owner/kos/add" className="rounded-full bg-[#1C1610] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#2C2416]">+ Tambah Kos</Link>
          <Link href="/dashboard/owner/kos" className="rounded-full bg-white border border-[#E8DCC8] px-5 py-2.5 text-sm font-medium hover:bg-[#FDFBF7]">Lihat Kos</Link>
        </div>
      </div>

      {/* KPI 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]"><IBuilding className="h-4 w-4"/></span><span className="text-[11px] tracking-widest uppercase text-[#2E7D32] bg-[#EAF6EC] border border-[#C8E6C9] rounded-full px-2 py-0.5">Aktif</span></div>
          <div className="serif text-[28px] leading-none mt-3">{stats.kos}</div>
          <div className="text-xs text-[#8A7D6B]">Total Kos</div>
          <div className="mt-2 h-1 rounded-full bg-[#F5F0E8]"><div className="h-1 rounded-full bg-[#C9A96A]" style={{width:"78%"}} /></div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A] text-sm">◐</span><span className="text-xs font-semibold text-[#C9A96A]">{okupansi}% terisi</span></div>
          <div className="serif text-[28px] leading-none mt-3">{stats.terisi}<span className="text-lg text-[#8A7D6B]">/{stats.kamar}</span></div>
          <div className="text-xs text-[#8A7D6B]">Kamar • {stats.kosong} kosong</div>
          <div className="mt-2 flex gap-1">{Array.from({length:4}).map((_,i)=><span key={i} className={`h-1.5 flex-1 rounded-full ${i<Math.ceil(okupansi/25)?"bg-[#1C1610]":"bg-[#EDE6D6]"}`} />)}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-4 text-white shadow-soft-lg">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-white/10 border border-white/15 grid place-items-center text-[#C9A96A]"><IWallet className="h-4 w-4"/></span><span className="text-[11px] tracking-widest uppercase text-[#E8DCC8]">Pendapatan</span></div>
          <div className="serif text-[20px] mt-3">Rp {(stats.pendapatan/1000000).toFixed(1)}<span className="text-sm font-sans font-normal"> jt</span></div>
          <div className="text-xs text-[#E8DCC8]">Bulan ini</div>
          <div className="mt-1 text-[11px] text-[#C9A96A]">↗ Prediksi +12% bulan depan</div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]">◎</span><span className="text-[11px] rounded-full bg-[#FFF3E0] border border-[#FFE0B2] px-2 py-0.5 text-[#8A6D1E]">{stats.booking} pending</span></div>
          <div className="serif text-[28px] leading-none mt-3">{stats.booking}</div>
          <div className="text-xs text-[#8A7D6B]">Booking Masuk</div>
          <Link href="/dashboard/owner/kos" className="mt-2 inline-block text-xs font-medium text-[#C9A96A]">Kelola →</Link>
        </div>
      </div>

      {/* chart + okupansi */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="flex items-center justify-between"><div className="text-sm font-semibold">Pendapatan 7 hari</div><span className="text-xs rounded-full border border-[#EDE6D6] bg-[#FDFBF7] px-3 py-1">Harian</span></div>
          <div className="mt-4 h-[128px] flex items-end gap-2">
            {[42,58,66,48,72,80,54].map((h,i)=><div key={i} className="flex-1 rounded-t-xl bg-[#F5F0E8] border border-[#EDE6D6] relative" style={{height:`${h}%`}}><div className={`absolute bottom-0 w-full rounded-t-xl ${i===2?"bg-[#1C1610]":"bg-[#C9A96A]"}`} style={{height: i===2?"92%":"80%"}} /></div>)}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[#B8A99A]"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="text-sm font-semibold">Okupansi</div>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-[110px] w-[110px] rounded-full border-[10px] border-[#F5F0E8] grid place-items-center" style={{borderTopColor:"#C9A96A",borderRightColor:"#1C1610",borderBottomColor:"#C9A96A",borderLeftColor:"#F5F0E8"}}>
              <span className="serif text-xl">{okupansi}%</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#1C1610]"/> Terisi {stats.terisi}</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#C9A96A]"/> Kosong {stats.kosong}</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#EDE6D6]"/> Total {stats.kamar}</div>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-xs leading-relaxed text-[#6B5E4F]"><ISparkle className="inline h-3 w-3 text-[#C9A96A]"/> <b className="text-[#1C1610]">AI Insight:</b> {stats.kosong>0?`${stats.kosong} kamar kosong — coba promo 10% 3 hari.`:"Okupansi bagus, pertahankan harga."}</div>
        </div>
      </div>

      {/* booking + aksi */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#EDE6D6] shadow-soft overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-[#F5F0E8]"><div className="text-sm font-semibold">Booking terbaru</div><Link href="/dashboard/owner/kos" className="text-xs font-medium text-[#C9A96A]">Lihat semua →</Link></div>
          <div className="divide-y divide-[#F5F0E8] text-sm">
            <div className="p-3 flex items-center gap-3"><Image src="https://picsum.photos/seed/kos1/80/80" alt="kos" width={80} height={80} className="h-10 w-10 rounded-xl object-cover border border-[#EDE6D6]" unoptimized /><div className="flex-1 min-w-0"><div className="font-medium truncate">Kos Aman Sentosa — A-02</div><div className="text-xs text-[#8A7D6B]">Member • Rp1.500.000</div></div><span className="rounded-full bg-[#FFF3E0] border border-[#FFE0B2] px-2.5 py-1 text-xs">Pending</span></div>
            <div className="p-3 flex items-center gap-3"><Image src="https://picsum.photos/seed/kos2/80/80" alt="kos" width={80} height={80} className="h-10 w-10 rounded-xl object-cover border border-[#EDE6D6]" unoptimized /><div className="flex-1 min-w-0"><div className="font-medium truncate">Kos Elite Cempaka — C-01</div><div className="text-xs text-[#8A7D6B]">Member • Rp2.200.000</div></div><span className="rounded-full bg-[#EAF6EC] border border-[#C8E6C9] px-2.5 py-1 text-xs">Paid</span></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
            <div className="text-sm font-semibold">Aksi cepat</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/dashboard/owner/kos/add" className="rounded-xl bg-[#1C1610] text-white p-3 text-xs font-medium text-center">+ Kos</Link>
              <Link href="/dashboard/owner/promosi" className="rounded-xl bg-white border border-[#E8DCC8] p-3 text-xs font-medium text-center">Promo</Link>
              <Link href="/kos/cari" className="rounded-xl bg-white border border-[#E8DCC8] p-3 text-xs font-medium text-center">Cari Kos</Link>
              <Link href="/ai" className="rounded-xl bg-white border border-[#E8DCC8] p-3 text-xs font-medium text-center">AI Chat</Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
            <div className="text-sm font-semibold">Status sistem</div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[#8A7D6B]">Payment</span><span className="text-[#2E7D32] font-medium">● Mock OK</span></div>
              <div className="flex justify-between"><span className="text-[#8A7D6B]">Database</span><span className="text-[#2E7D32] font-medium">● {stats.kos} kos / {stats.kamar} kamar</span></div>
              <div className="flex justify-between"><span className="text-[#8A7D6B]">AI</span><span className="text-[#8A7D6B] font-medium">● Mock</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
