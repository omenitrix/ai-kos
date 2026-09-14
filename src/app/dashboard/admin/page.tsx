"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

function IUsers(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
function IShield(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z"/></svg>}
function IBuilding(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>}
function IWallet(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h4"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/></svg>}
function ISparkle(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9z"/></svg>}

export default function AdminDashboard() {
  const [a, setA] = useState<any>({ totalUsers: 4, totalOwners: 1, totalKos: 2, totalBookings: 1, totalRevenue: 0 });
  const [pending, setPending] = useState(0);
  useEffect(()=>{
    fetch("/api/admin/analytics").then(r=>r.json()).then(d=>{ if(d.totalUsers!=null) setA(d); }).catch(()=>{});
    fetch("/api/admin/listings").then(r=>r.json()).then((d:any)=>{
      const arr = Array.isArray(d)?d:d.data||[];
      setPending(arr.length);
    }).catch(()=>{});
    fetch("/api/admin/transaksi").then(r=>r.json()).then((d:any)=>{
      const arr = Array.isArray(d)?d:d.data||[];
      if(arr.length) setA((s:any)=>({...s, totalBookings: arr.length}));
    }).catch(()=>{});
  },[]);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="serif text-[26px] leading-none">Kontrol Pusat <span className="text-[#C9A96A]">AI-KOS</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">Ringkasan platform • {a.totalUsers} user • {a.totalKos} kos • update real-time</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/listings" className="rounded-full bg-[#1C1610] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#2C2416]">Review Pending {pending?`(${pending})`:""}</Link>
          <Link href="/dashboard/admin/analytics" className="rounded-full bg-white border border-[#E8DCC8] px-5 py-2.5 text-sm font-medium hover:bg-[#FDFBF7]">Analytics</Link>
        </div>
      </div>

      {/* KPI 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]"><IUsers className="h-4 w-4"/></span><span className="text-[11px] tracking-widest uppercase text-[#2E7D32] bg-[#EAF6EC] border border-[#C8E6C9] rounded-full px-2 py-0.5">+1 minggu ini</span></div>
          <div className="serif text-[28px] leading-none mt-3">{a.totalUsers}</div>
          <div className="text-xs text-[#8A7D6B]">Total Pengguna</div>
          <div className="mt-2 h-1 rounded-full bg-[#F5F0E8]"><div className="h-1 rounded-full bg-[#C9A96A]" style={{width:"68%"}} /></div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]"><IShield className="h-4 w-4"/></span><span className="text-xs font-semibold text-[#C9A96A]">Verified</span></div>
          <div className="serif text-[28px] leading-none mt-3">{a.totalOwners}</div>
          <div className="text-xs text-[#8A7D6B]">Owner Terverifikasi</div>
          <div className="mt-2 flex gap-1"><span className="h-1.5 flex-1 rounded-full bg-[#1C1610]"/><span className="h-1.5 flex-1 rounded-full bg-[#EDE6D6]"/><span className="h-1.5 flex-1 rounded-full bg-[#EDE6D6]"/><span className="h-1.5 flex-1 rounded-full bg-[#EDE6D6]"/></div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-4 text-white shadow-soft-lg">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-white/10 border border-white/15 grid place-items-center text-[#C9A96A]"><IBuilding className="h-4 w-4"/></span><span className="text-[11px] tracking-widest uppercase text-[#E8DCC8]">Kos Aktif</span></div>
          <div className="serif text-[28px] mt-3">{a.totalKos}</div>
          <div className="text-xs text-[#E8DCC8]">{pending?`${pending} menunggu approval`:"Semua terverifikasi"}</div>
          <Link href="/dashboard/admin/listings" className="mt-1 inline-block text-[11px] text-[#C9A96A]">Kelola listing →</Link>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]"><IWallet className="h-4 w-4"/></span><span className="text-[11px] rounded-full bg-[#EAF6EC] border border-[#C8E6C9] px-2 py-0.5 text-[#2E7D32]">{a.totalBookings} booking</span></div>
          <div className="serif text-[20px] leading-none mt-3">Rp {(Number(a.totalRevenue||0)/1000000).toFixed(1)}<span className="text-sm font-sans font-normal text-[#8A7D6B]"> jt</span></div>
          <div className="text-xs text-[#8A7D6B]">Revenue tercatat</div>
          <Link href="/dashboard/admin/transaksi" className="mt-2 inline-block text-xs font-medium text-[#C9A96A]">Lihat transaksi →</Link>
        </div>
      </div>

      {/* chart + moderasi */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="flex items-center justify-between"><div className="text-sm font-semibold">Transaksi 7 hari</div><span className="text-xs rounded-full border border-[#EDE6D6] bg-[#FDFBF7] px-3 py-1">Harian</span></div>
          <div className="mt-4 h-[128px] flex items-end gap-2">
            {[38,52,44,66,58,72,48].map((h,i)=><div key={i} className="flex-1 rounded-t-xl bg-[#F5F0E8] border border-[#EDE6D6] relative" style={{height:`${h}%`}}><div className={`absolute bottom-0 w-full rounded-t-xl ${i===5?"bg-[#1C1610]":"bg-[#C9A96A]"}`} style={{height: i===5?"94%":"78%"}} /></div>)}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[#B8A99A]"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="text-sm font-semibold">Antrian Moderasi</div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3">
              <div><div className="text-sm font-medium">Listing Pending</div><div className="text-xs text-[#8A7D6B]">{pending} kos menunggu</div></div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${pending?"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]":"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]"}`}>{pending||0}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3">
              <div><div className="text-sm font-medium">Verifikasi KTP</div><div className="text-xs text-[#8A7D6B]">Mock — siap integrasi</div></div>
              <span className="rounded-full bg-white border border-[#EDE6D6] px-2.5 py-1 text-xs">0</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3">
              <div><div className="text-sm font-medium">Laporan Fraud</div><div className="text-xs text-[#8A7D6B]">AI detection</div></div>
              <span className="rounded-full bg-[#EAF6EC] border border-[#C8E6C9] px-2.5 py-1 text-xs text-[#2E7D32]">Aman</span>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-xs leading-relaxed text-[#6B5E4F]"><ISparkle className="inline h-3 w-3 text-[#C9A96A]"/> <b className="text-[#1C1610]">AI Insight:</b> {pending?`${pending} listing butuh review < 24 jam.`:"Antrian bersih — performa moderasi baik."}</div>
        </div>
      </div>

      {/* bawah: log + aksi + status */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#EDE6D6] shadow-soft overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-[#F5F0E8]"><div className="text-sm font-semibold">Aktivitas terbaru</div><Link href="/dashboard/admin/logs" className="text-xs font-medium text-[#C9A96A]">Lihat logs →</Link></div>
          <div className="divide-y divide-[#F5F0E8] text-sm">
            <div className="p-3 flex items-center gap-3"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-xs">✓</span><div className="flex-1 min-w-0"><div className="font-medium truncate">Seed data dimuat</div><div className="text-xs text-[#8A7D6B]">2 kos • 4 kamar • 3 marketplace</div></div><span className="text-xs text-[#B8A99A]">Hari ini</span></div>
            <div className="p-3 flex items-center gap-3"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-xs">◉</span><div className="flex-1 min-w-0"><div className="font-medium truncate">User baru mendaftar</div><div className="text-xs text-[#8A7D6B]">member@ai-kos.test bergabung</div></div><span className="text-xs text-[#B8A99A]">12 Sep</span></div>
            <div className="p-3 flex items-center gap-3"><span className="h-8 w-8 rounded-xl bg-[#FFF3E0] border border-[#FFE0B2] grid place-items-center text-xs">!</span><div className="flex-1 min-w-0"><div className="font-medium truncate">Booking DRAFT dibuat</div><div className="text-xs text-[#8A7D6B]">Kamar A-01 → menunggu pembayaran</div></div><span className="text-xs text-[#B8A99A]">12 Sep</span></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
            <div className="text-sm font-semibold">Aksi cepat</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/dashboard/admin/users" className="rounded-xl bg-[#1C1610] text-white p-3 text-xs font-medium text-center">Kelola User</Link>
              <Link href="/dashboard/admin/listings" className="rounded-xl bg-white border border-[#E8DCC8] p-3 text-xs font-medium text-center">Approval</Link>
              <Link href="/dashboard/admin/transaksi" className="rounded-xl bg-white border border-[#E8DCC8] p-3 text-xs font-medium text-center">Transaksi</Link>
              <Link href="/dashboard/admin/analytics" className="rounded-xl bg-white border border-[#E8DCC8] p-3 text-xs font-medium text-center">Analytics</Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
            <div className="text-sm font-semibold">Status sistem</div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[#8A7D6B]">Database</span><span className="text-[#2E7D32] font-medium">● {a.totalUsers} users / {a.totalKos} kos</span></div>
              <div className="flex justify-between"><span className="text-[#8A7D6B]">Payment</span><span className="text-[#2E7D32] font-medium">● Mock OK</span></div>
              <div className="flex justify-between"><span className="text-[#8A7D6B]">Storage</span><span className="text-[#2E7D32] font-medium">● Mock OK</span></div>
              <div className="flex justify-between"><span className="text-[#8A7D6B]">AI Provider</span><span className="text-[#8A7D6B] font-medium">● Mock</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
