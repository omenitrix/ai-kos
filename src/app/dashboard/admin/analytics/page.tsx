"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function IUsers(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
function IBuilding(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>}
function IWallet(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h4"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/></svg>}
function ISparkle(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9z"/></svg>}
function IShield(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z"/></svg>}
function IMap(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M1 6l7-3 7 3 7-3v14l-7 3-7-3-7 3z"/><path d="M8 3v14M15 6v14"/></svg>}
function IShop(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M6 7h12l-1 9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>}

export default function AdminAnalytics() {
  const [d,setD]=useState<any>(null);
  const [err,setErr]=useState("");
  useEffect(()=>{ fetch("/api/admin/analytics").then(r=>r.json()).then(j=>{ if(j.error) setErr(j.error); else setD(j); }).catch(e=>setErr(String(e))); },[]);
  if (err) return <div className="p-6"><Link href="/dashboard/admin" className="text-sm text-[#8A7D6B] hover:underline">← Dashboard</Link><p className="mt-4 text-sm text-red-600">Butuh login ADMIN • {err}</p></div>;
  if (!d) return <div className="p-6 text-sm text-[#8A7D6B]">Memuat analytics platform…</div>;

  const { pengguna, listing, transaksi, revenue, geografis, kosBermasalah, keamanan, marketplace } = d;

  const onExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.setTextColor("#1C1610");
    doc.text("AI-KOS — Analytics Platform", 14, 18);
    doc.setFontSize(9); doc.setTextColor("#8A7D6B");
    doc.text(`Export: ${new Date().toLocaleString("id-ID")} • ai-kos-ten.vercel.app`, 14, 24);
    const rows:any[] = [
      ["Total Pengguna", String(pengguna.totalUsers)],
      ["Owner", String(pengguna.totalOwners)], ["Member", String(pengguna.totalMembers)], ["Guest", String(pengguna.totalGuests)],
      ["Baru 7 hari", String(pengguna.newUsersWeek)], ["Baru 30 hari", String(pengguna.newUsersMonth)],
      ["Retention", pengguna.retention], ["Churn", pengguna.churn],
      ["Total Kos", String(listing.totalKos)], ["Kos Aktif", String(listing.kosAktif)], ["Kos Nonaktif", String(listing.kosNonaktif)],
      ["Pending Approval", String(listing.pending)], ["Avg approval", `${listing.avgApprovalJam} jam`], ["Ditolak", String(listing.ditolak)],
      ["Total Bookings", String(transaksi.totalBookings)], ["Sukses", String(transaksi.bookingSukses)], ["Batal", String(transaksi.bookingBatal)], ["Pending", String(transaksi.bookingPending)],
      ["GMV", `Rp ${Number(transaksi.gmv).toLocaleString("id-ID")}`],
      ["Platform Revenue", `Rp ${Number(revenue.platformRevenue).toLocaleString("id-ID")}`], ["Fee", `${revenue.feePersen}%`], ["Bulan ini", `Rp ${Number(revenue.bulanIni).toLocaleString("id-ID")}`],
      ["Kos Bermasalah", String(kosBermasalah)],
      ["Suspended", String(keamanan.suspended)], ["Fake booking", String(keamanan.fakeBookingTerdeteksi)], ["Verif Gagal", String(keamanan.verifGagal)],
    ];
    autoTable(doc, { startY: 30, head: [["Metric","Value"]], body: rows, theme:"grid", headStyles:{fillColor:[201,169,106]}, styles:{fontSize:8}, margin:{left:14,right:14} });
    // geografis
    const y2 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10); doc.setTextColor("#1C1610"); doc.text("Sebaran Geografis (Top 5)", 14, y2);
    const geoRows = (geografis||[]).map((g:any)=>[g.kota, String(g.jumlah)]);
    autoTable(doc, { startY: y2+4, head:[["Kota","Jumlah Kos"]], body: geoRows.length?geoRows:[["-","0"]], theme:"grid", headStyles:{fillColor:[28,22,16]}, styles:{fontSize:8}, margin:{left:14,right:14} });
    doc.save(`AIKOS-admin-analytics-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const onExportExcel = () => {
    const rows = [
      ["AI-KOS Analytics Platform", `Export ${new Date().toLocaleString("id-ID")}`],
      [],
      ["Metric","Value"],
      ["Total Pengguna", pengguna.totalUsers],
      ["Owner", pengguna.totalOwners], ["Member", pengguna.totalMembers], ["Guest", pengguna.totalGuests],
      ["Baru 7 hari", pengguna.newUsersWeek], ["Baru 30 hari", pengguna.newUsersMonth],
      ["Retention", pengguna.retention], ["Churn", pengguna.churn],
      ["Total Kos", listing.totalKos], ["Kos Aktif", listing.kosAktif], ["Kos Nonaktif", listing.kosNonaktif],
      ["Pending Approval", listing.pending], ["Avg approval (jam)", listing.avgApprovalJam], ["Ditolak", listing.ditolak],
      ["Total Bookings", transaksi.totalBookings], ["Sukses", transaksi.bookingSukses], ["Batal", transaksi.bookingBatal], ["Pending", transaksi.bookingPending],
      ["GMV", transaksi.gmv], ["Platform Revenue", revenue.platformRevenue], ["Fee %", revenue.feePersen], ["Bulan ini", revenue.bulanIni],
      ["Kos Bermasalah", kosBermasalah],
      ["Suspended", keamanan.suspended], ["Fake booking", keamanan.fakeBookingTerdeteksi], ["Verif Gagal", keamanan.verifGagal],
      [],
      ["Sebaran Geografis"],
      ["Kota","Jumlah"],
      ...(geografis||[]).map((g:any)=>[g.kota, g.jumlah]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows as any);
    ws["!cols"] = [{wch:22},{wch:28}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Analytics");
    XLSX.writeFile(wb, `AIKOS-admin-analytics-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/dashboard/admin" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Dashboard Admin</Link>
          <h1 className="serif text-[26px] leading-none mt-1">Analytics <span className="text-[#C9A96A]">Platform</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">Kesehatan bisnis AI-KOS secara keseluruhan — real-time</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#1C1610] text-white px-4 py-2 text-xs font-medium">Live • {new Date().toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}</span>
          <button onClick={onExportPDF} className="rounded-full bg-white border border-[#EDE6D6] px-4 py-2 text-xs font-semibold hover:bg-[#FDFBF7]">Export PDF</button>
          <button onClick={onExportExcel} className="rounded-full bg-[#C9A96A] text-white px-4 py-2 text-xs font-semibold hover:bg-[#B8944F]">Export Excel</button>
        </div>
      </div>

      {/* KPI 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]"><IUsers className="h-4 w-4"/></span><span className="text-[11px] tracking-widest uppercase text-[#2E7D32] bg-[#EAF6EC] border border-[#C8E6C9] rounded-full px-2 py-0.5">+{pengguna.newUsersWeek} minggu ini</span></div>
          <div className="serif text-[28px] leading-none mt-3">{pengguna.totalUsers}</div>
          <div className="text-xs text-[#8A7D6B]">Total Pengguna • {pengguna.totalOwners} Owner • {pengguna.totalMembers} Member</div>
          <div className="mt-2 text-[11px] text-[#6B5E4F]">Retention {pengguna.retention} • Churn {pengguna.churn}</div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]"><IBuilding className="h-4 w-4"/></span><span className={`text-[11px] rounded-full px-2 py-0.5 border ${listing.pending?"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]":"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]"}`}>{listing.pending} pending</span></div>
          <div className="serif text-[28px] leading-none mt-3">{listing.totalKos}</div>
          <div className="text-xs text-[#8A7D6B]">Total Listing • {listing.kosAktif} aktif • {listing.kosNonaktif} nonaktif</div>
          <div className="mt-2 text-[11px] text-[#6B5E4F]">Avg approval {listing.avgApprovalJam} jam • Ditolak {listing.ditolak}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-4 text-white shadow-soft-lg">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-white/10 border border-white/15 grid place-items-center text-[#C9A96A]"><IWallet className="h-4 w-4"/></span><span className="text-[11px] tracking-widest uppercase text-[#E8DCC8]">GMV Platform</span></div>
          <div className="serif text-[20px] mt-3">Rp {(transaksi.gmv/1000000).toFixed(1)}<span className="text-sm font-sans font-normal"> jt</span></div>
          <div className="text-xs text-[#E8DCC8]">{transaksi.bookingSukses} sukses • {transaksi.bookingBatal} batal • {transaksi.bookingPending} pending</div>
          <div className="mt-1 text-[11px] text-[#C9A96A]">Tren 7 hari ↗</div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="flex items-center justify-between"><span className="h-8 w-8 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]"><IWallet className="h-4 w-4"/></span><span className="text-[11px] rounded-full bg-[#F5F0E8] border border-[#E8DCC8] px-2 py-0.5">Fee {revenue.feePersen}%</span></div>
          <div className="serif text-[20px] leading-none mt-3">Rp {(revenue.platformRevenue/1000000).toFixed(1)}<span className="text-sm font-sans font-normal text-[#8A7D6B]"> jt</span></div>
          <div className="text-xs text-[#8A7D6B]">Revenue Platform • Bulan ini Rp {(revenue.bulanIni/1000000).toFixed(1)} jt</div>
        </div>
      </div>

      {/* chart + listing */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="flex items-center justify-between"><div className="text-sm font-semibold">GMV 7 hari</div><span className="text-xs rounded-full border border-[#EDE6D6] bg-[#FDFBF7] px-3 py-1">Harian</span></div>
          <div className="mt-4 h-[128px] flex items-end gap-2">
            {transaksi.tren7Hari.map((h:number,i:number)=><div key={i} className="flex-1 rounded-t-xl bg-[#F5F0E8] border border-[#EDE6D6] relative" style={{height:`${h}%`}}><div className={`absolute bottom-0 w-full rounded-t-xl ${i===5?"bg-[#1C1610]":"bg-[#C9A96A]"}`} style={{height:"90%"}} /></div>)}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[#B8A99A]"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-center"><div className="text-[#8A7D6B]">Sukses</div><div className="font-bold text-sm">{transaksi.bookingSukses}</div></div>
            <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-center"><div className="text-[#8A7D6B]">Gagal/Batal</div><div className="font-bold text-sm">{transaksi.bookingBatal}</div></div>
            <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-center"><div className="text-[#8A7D6B]">Pending</div><div className="font-bold text-sm">{transaksi.bookingPending}</div></div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="text-sm font-semibold">Sebaran Geografis</div>
          <p className="text-xs text-[#8A7D6B]">Kota dengan kos terbanyak</p>
          <div className="mt-4 space-y-2">
            {geografis.length? geografis.map((g:any)=>(
              <div key={g.kota} className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-lg bg-[#FDFBF7] border border-[#EDE6D6] grid place-items-center text-[#C9A96A]"><IMap className="h-3.5 w-3.5"/></span>
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{g.kota}</div><div className="h-1.5 rounded-full bg-[#F5F0E8] mt-1"><div className="h-1.5 rounded-full bg-[#C9A96A]" style={{width:`${Math.min(100, g.jumlah*30)}%`}} /></div></div>
                <span className="text-sm font-bold">{g.jumlah}</span>
              </div>
            )) : <p className="text-xs text-[#8A7D6B]">Belum ada data alamat.</p>}
          </div>
          <div className="mt-4 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-xs leading-relaxed text-[#6B5E4F]"><ISparkle className="inline h-3 w-3 text-[#C9A96A]"/> <b className="text-[#1C1610]">Kos bermasalah:</b> {kosBermasalah} kos okupansi rendah &gt;30 hari — kandidat follow-up admin.</div>
        </div>
      </div>

      {/* keamanan + marketplace */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold"><IShield className="h-4 w-4 text-[#C9A96A]"/> Keamanan & Fraud</div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3"><div><div className="text-sm font-medium">Akun di-suspend</div><div className="text-xs text-[#8A7D6B]">isSuspended = true</div></div><span className="rounded-full bg-white border border-[#EDE6D6] px-3 py-1 text-sm font-bold">{keamanan.suspended}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-[#FFF3E0] border border-[#FFE0B2] p-3"><div><div className="text-sm font-medium">Fake booking (AI)</div><div className="text-xs text-[#8A7D6B]">Deteksi heuristik</div></div><span className="rounded-full bg-white border border-[#FFE0B2] px-3 py-1 text-sm font-bold text-[#8A6D1E]">{keamanan.fakeBookingTerdeteksi}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3"><div><div className="text-sm font-medium">Verifikasi gagal</div><div className="text-xs text-[#8A7D6B]">KTP/wajah</div></div><span className="rounded-full bg-white border border-[#EDE6D6] px-3 py-1 text-sm font-bold">{keamanan.verifGagal}</span></div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold"><IShop className="h-4 w-4 text-[#C9A96A]"/> Marketplace Performance</div>
          <div className="mt-4 space-y-2">
            {marketplace.length? marketplace.map((m:any)=>(
              <div key={m.kategori} className="flex items-center justify-between rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] px-3 py-2.5">
                <span className="text-xs font-medium tracking-widest uppercase text-[#6B5E4F]">{m.kategori}</span><span className="rounded-full bg-white border border-[#E8DCC8] px-2.5 py-0.5 text-xs font-bold">{m._count} item</span>
              </div>
            )) : <p className="text-xs text-[#8A7D6B]">Belum ada transaksi marketplace.</p>}
          </div>
          <Link href="/marketplace" className="mt-3 inline-block text-xs font-medium text-[#C9A96A]">Buka Marketplace →</Link>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-5 text-white shadow-soft-lg flex flex-col">
          <div className="text-sm font-medium flex items-center gap-2"><ISparkle className="h-4 w-4 text-[#C9A96A]"/> Ringkasan Admin</div>
          <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-[#E8DCC8] list-disc pl-4">
            <li>{pengguna.newUsersMonth} pendaftar baru bulan ini — onboarding owner percepat approval.</li>
            <li>{listing.pending} listing pending, alasan top: {listing.alasanTop}.</li>
            <li>GMV Rp {(transaksi.gmv/1000000).toFixed(0)} jt, fee platform Rp {(revenue.platformRevenue/1000000).toFixed(0)} jt.</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Link href="/dashboard/admin/listings" className="rounded-full bg-[#C9A96A] px-4 py-2 text-xs font-semibold text-white">Review Listing</Link>
            <Link href="/dashboard/admin/users" className="rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-medium">Kelola User</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
