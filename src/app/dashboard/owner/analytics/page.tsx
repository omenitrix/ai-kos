"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function IWallet(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h4"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/></svg>}
function ISparkle(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9z"/></svg>}

export default function OwnerAnalytics() {
  const [d,setD]=useState<any>(null); const [err,setErr]=useState("");
  useEffect(()=>{ fetch("/api/owner/analytics").then(r=>r.json()).then(j=>{ if(j.error) setErr(j.error); else setD(j); }).catch(e=>setErr(String(e))); },[]);
  if (err) return <div className="p-6"><Link href="/dashboard/owner" className="text-sm text-[#8A7D6B] hover:underline">← Dashboard</Link><p className="mt-4 text-sm text-red-600">{err} — login sebagai OWNER.</p></div>;
  if (!d) return <div className="p-6 text-sm text-[#8A7D6B]">Memuat analytics kos kamu…</div>;
  const { ringkasan, pendapatan, hargaPasar, funnel, sumber, retensi, tagihan, trenOkupansi, rating, demografi } = d;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/dashboard/owner" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Dashboard Owner</Link>
          <h1 className="serif text-[26px] leading-none mt-1">Analytics <span className="text-[#C9A96A]">Kos Kamu</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">Performa bisnis • actionable untuk harga & promosi</p>
        </div>
        <span className="rounded-full bg-[#1C1610] text-white px-4 py-2 text-xs font-medium">Live • {ringkasan.totalKos} kos</span>
      </div>

      {/* KPI 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="text-[11px] tracking-widest uppercase text-[#8A7D6B]">Okupansi</div>
          <div className="serif text-[28px] leading-none mt-1">{ringkasan.okupansi}%</div>
          <div className="text-xs text-[#8A7D6B]">{ringkasan.terisi}/{ringkasan.totalKamar} kamar • {ringkasan.kosong} kosong</div>
          <div className="mt-2 flex gap-1">{Array.from({length:4}).map((_,i)=><span key={i} className={`h-1.5 flex-1 rounded-full ${i<Math.ceil(ringkasan.okupansi/25)?"bg-[#1C1610]":"bg-[#EDE6D6]"}`} />)}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-4 text-white shadow-soft-lg">
          <div className="flex items-center justify-between"><span className="text-[11px] tracking-widest uppercase text-[#E8DCC8]">Pendapatan</span><span className={`text-[11px] rounded-full px-2 py-0.5 border ${pendapatan.growth>=0?"bg-[#1B3320] border-[#2E7D32] text-[#A5D6A7]":"bg-[#3D1F1F] border-[#8B2D2D] text-[#E8A0A0]"}`}>{pendapatan.growth>=0?`+${pendapatan.growth}%`:`${pendapatan.growth}%`}</span></div>
          <div className="serif text-[20px] mt-2">Rp {(pendapatan.pendapatanBulanIni/1000000).toFixed(1)}<span className="text-sm font-sans font-normal"> jt</span></div>
          <div className="text-xs text-[#E8DCC8]">Bulan ini • lalu Rp {(pendapatan.pendapatanBulanLalu/1000000).toFixed(1)} jt</div>
          <div className="mt-1 text-[11px] text-[#C9A96A]">Prediksi bulan depan Rp {(pendapatan.prediksi/1000000).toFixed(1)} jt</div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="text-[11px] tracking-widest uppercase text-[#8A7D6B]">Harga vs Pasar</div>
          <div className="serif text-[18px] leading-none mt-1">Rp {(hargaPasar.avgHargaSendiri/1000).toFixed(0)}rb</div>
          <div className="text-xs text-[#8A7D6B]">Pasar {hargaPasar.area}: Rp {(hargaPasar.avgPasar/1000).toFixed(0)}rb • <span className={Number(hargaPasar.posisiHarga)>0?"text-[#8A6D1E]":"text-[#2E7D32]"}>{Number(hargaPasar.posisiHarga)>0?`+${hargaPasar.posisiHarga}%`:`${hargaPasar.posisiHarga}%`}</span></div>
          <div className="mt-2 h-1.5 rounded-full bg-[#F5F0E8]"><div className="h-1.5 rounded-full bg-[#C9A96A]" style={{width:`${Math.min(100, Math.max(10, 50+Number(hargaPasar.posisiHarga)*2))}%`}} /></div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4 shadow-soft">
          <div className="text-[11px] tracking-widest uppercase text-[#8A7D6B]">Tagihan</div>
          <div className="serif text-[28px] leading-none mt-1">{tagihan.telat}</div>
          <div className="text-xs text-[#8A7D6B]">Telat bayar • {tagihan.lunas} lunas dari {tagihan.total}</div>
          <div className="mt-2 text-xs font-medium text-[#C9A96A]">{tagihan.telat?`${tagihan.telat} perlu reminder →`:"Semua lunas ✓"}</div>
        </div>
      </div>

      {/* pendapatan + okupansi */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="flex items-center justify-between"><div className="text-sm font-semibold">Pendapatan 6 bulan</div><span className="text-xs rounded-full border border-[#EDE6D6] bg-[#FDFBF7] px-3 py-1">jt rupiah</span></div>
          <div className="mt-4 h-[128px] flex items-end gap-2">
            {pendapatan.trenPendapatan.map((v:number,i:number)=><div key={i} className="flex-1 rounded-t-xl bg-[#F5F0E8] border border-[#EDE6D6] relative" style={{height:`${Math.min(90, v*14)}%`}}><div className={`absolute bottom-0 w-full rounded-t-xl ${i===5?"bg-[#1C1610]":"bg-[#C9A96A]"}`} style={{height:"88%"}} /></div>)}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[#B8A99A]"><span>6 bln lalu</span><span>Bulan ini</span></div>
          <div className="mt-3 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-xs leading-relaxed text-[#6B5E4F]"><ISparkle className="inline h-3 w-3 text-[#C9A96A]"/> <b className="text-[#1C1610]">Prediksi AI:</b> Rp {(pendapatan.prediksi/1000000).toFixed(1)} jt bulan depan (+12% model heuristik).</div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="text-sm font-semibold">Tren Okupansi</div>
          <div className="mt-4 h-[90px] flex items-end gap-2">
            {trenOkupansi.map((v:number,i:number)=><div key={i} className="flex-1 rounded-t-xl bg-[#F5F0E8] border border-[#EDE6D6] relative" style={{height:`${v}%`}}><div className="absolute bottom-0 w-full rounded-t-xl bg-[#1C1610]" style={{height:"100%"}} /></div>)}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[#B8A99A]"><span>6 bln lalu</span><span>Sekarang {ringkasan.okupansi}%</span></div>
          <div className="mt-4 flex items-center gap-2 text-xs"><span className="h-2 w-2 rounded-full bg-[#1C1610]"/> Terisi {ringkasan.terisi}<span className="h-2 w-2 rounded-full bg-[#C9A96A] ml-2"/> Kosong {ringkasan.kosong}</div>
          <div className="mt-3 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-xs text-[#6B5E4F]">Retensi: avg {retensi.avgDurasi} bulan • perpanjangan {retensi.tingkatPerpanjangan}%</div>
        </div>
      </div>

      {/* funnel + sumber + rating */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="text-sm font-semibold">Funnel Konversi</div>
          <p className="text-xs text-[#8A7D6B]">Views → Chat → Survey → Booking</p>
          <div className="mt-4 space-y-2 text-xs">
            {[["Views", funnel.views],["Chat/Inquiry", funnel.chats],["Survey", funnel.surveys],["Booking", funnel.bookings]].map(([label,val]:any,i)=>(<div key={String(label)} className="flex items-center gap-2"><span className="w-[90px] text-[#6B5E4F]">{label}</span><div className="flex-1 h-2 rounded-full bg-[#F5F0E8]"><div className="h-2 rounded-full bg-[#C9A96A]" style={{width:`${Math.max(12, 100 - i*22)}%`}} /></div><span className="w-8 text-right font-bold">{val}</span></div>))}
          </div>
          <div className="mt-3 text-xs text-[#8A6D1E] bg-[#FFF3E0] border border-[#FFE0B2] rounded-xl px-3 py-2">Drop terbesar: Views→Chat {funnel.dropViewToChat}% — coba foto cover lebih menarik.</div>
        </div>
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="text-sm font-semibold">Sumber Booking & Tagihan</div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-center"><div className="text-[#8A7D6B]">Organik</div><div className="serif text-lg">{sumber.organik}</div></div>
            <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-center"><div className="text-[#8A7D6B]">Via Promo</div><div className="serif text-lg">{sumber.viaPromo}</div></div>
          </div>
          <div className="mt-3 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-xs"><div className="font-medium">Demografi Penyewa</div><div className="mt-2 space-y-1">{demografi.map((d:any)=><div key={d.segmen} className="flex items-center gap-2"><span className="w-[80px] text-[#6B5E4F]">{d.segmen}</span><div className="flex-1 h-1.5 rounded-full bg-[#EDE6D6]"><div className="h-1.5 rounded-full bg-[#1C1610]" style={{width:`${d.persen}%`}} /></div><span className="text-[11px] font-bold">{d.persen}%</span></div>)}</div></div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white border border-[#E8DCC8] px-3 py-2 text-xs"><span className="text-[#8A7D6B]">Rating & review</span><span className="font-bold">★ {rating.avg} • {rating.total} ulasan</span></div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-5 text-white shadow-soft-lg flex flex-col">
          <div className="text-sm font-medium flex items-center gap-2"><ISparkle className="h-4 w-4 text-[#C9A96A]"/> Insight Owner</div>
          <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-[#E8DCC8] list-disc pl-4">
            <li>Harga kamu {Number(hargaPasar.posisiHarga)>5?"di atas pasar — pertimbangkan promo":"kompetitif vs pasar"} di {hargaPasar.area}.</li>
            <li>{tagihan.telat?`${tagihan.telat} penyewa telat — kirim reminder otomatis.`:"Tagihan lancar, pertahankan."}</li>
            <li>Funnel drop {funnel.dropViewToChat}% — optimalkan foto & deskripsi.</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Link href="/dashboard/owner/promosi" className="rounded-full bg-[#C9A96A] px-4 py-2 text-xs font-semibold text-white">Buat Promo</Link>
            <Link href="/dashboard/owner/kos" className="rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-medium">Kelola Kos</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
