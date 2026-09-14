"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MemberInsights() {
  const [d,setD]=useState<any>(null); const [err,setErr]=useState("");
  useEffect(()=>{ fetch("/api/member/insights").then(r=>r.json()).then(j=>{ if(j.error) setErr(j.error); else setD(j); }).catch(e=>setErr(String(e))); },[]);
  if (err) return <div className="p-6"><Link href="/dashboard/member" className="text-sm text-[#8A7D6B] hover:underline">← Dashboard</Link><p className="mt-4 text-sm text-red-600">{err}</p></div>;
  if (!d) return <div className="p-6 text-sm text-[#8A7D6B]">Memuat insight personal…</div>;
  const { sewaAktif, riwayat, pembayaran, totalBayar, dilihat, hargaArea, rekomendasi } = d;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div>
        <Link href="/dashboard/member" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Dashboard Member</Link>
        <h1 className="serif text-[26px] leading-none mt-1">Insight <span className="text-[#C9A96A]">Kamu</span></h1>
        <p className="text-sm text-[#8A7D6B] mt-1">Ringkasan ringan — bantu keputusan, bukan monitoring berat</p>
      </div>

      {/* sewa aktif highlight */}
      {sewaAktif ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-5 text-white shadow-soft-lg">
          <span className="inline-block rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] tracking-widest uppercase">Sewa Aktif</span>
          <h2 className="serif text-[22px] mt-2">{sewaAktif.kos} {sewaAktif.kamar?`— ${sewaAktif.kamar}`:""}</h2>
          <p className="text-xs text-[#E8DCC8]">{sewaAktif.alamat}</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-white/10 border border-white/15 p-3"><div className="text-[#E8DCC8]">Harga</div><div className="font-semibold mt-0.5">Rp {(sewaAktif.harga||0).toLocaleString("id-ID")}/bln</div></div>
            <div className="rounded-xl bg-white/10 border border-white/15 p-3"><div className="text-[#E8DCC8]">Status</div><div className="font-semibold mt-0.5">{sewaAktif.status}</div></div>
            <div className="rounded-xl bg-white/10 border border-white/15 p-3"><div className="text-[#E8DCC8]">Jatuh Tempo</div><div className="font-semibold mt-0.5">{sewaAktif.jatuhTempo||"-"}</div></div>
            <div className="rounded-xl bg-[#C9A96A] p-3 text-white"><div className="text-white/80">Sisa Durasi</div><div className="font-bold mt-0.5">{sewaAktif.sisaHari!=null?`${sewaAktif.sisaHari} hari`:"-"}</div></div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href="/dashboard/member/penyewaan/aktif" className="rounded-full bg-white text-[#1C1610] px-4 py-2 text-xs font-semibold">Detail Sewa</Link>
            <Link href="/dashboard/member/pembayaran" className="rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-medium">Bayar Tagihan</Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft text-sm text-[#8A7D6B]">Belum ada sewa aktif. Mulai cari kos di <Link href="/kos/cari" className="text-[#C9A96A] font-medium">Cari Kos</Link>.</div>
      )}

      <div className="grid lg:grid-cols-3 gap-3">
        {/* transparansi harga */}
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="text-sm font-semibold">Transparansi Harga Area</div>
          <p className="text-xs text-[#8A7D6B]">Bandingkan harga kos kamu vs rata-rata pasar sekitar</p>
          {hargaArea ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3"><span className="text-xs text-[#8A7D6B]">Harga kamu</span><span className="font-bold">Rp {(hargaArea.hargaSaya||0).toLocaleString("id-ID")}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3"><span className="text-xs text-[#8A7D6B]">Rata-rata pasar</span><span className="font-bold">Rp {(hargaArea.avgPasar||0).toLocaleString("id-ID")}</span></div>
              <div className={`rounded-xl p-3 text-xs font-medium border ${hargaArea.selisih>10?"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]": hargaArea.selisih<-10?"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]":"bg-[#FDFBF7] border-[#EDE6D6] text-[#6B5E4F]"}`}>
                {hargaArea.selisih>10?`Harga kamu ${hargaArea.selisih}% di atas pasar — coba nego perpanjangan.` : hargaArea.selisih<-10? `Harga kamu ${Math.abs(hargaArea.selisih)}% di bawah pasar — deal bagus!` : "Harga kamu seimbang dengan pasar area."}
              </div>
            </div>
          ) : <p className="mt-4 text-xs text-[#8A7D6B]">Belum ada data area. Booking kos untuk lihat komparasi.</p>}
        </div>

        {/* riwayat pembayaran */}
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="flex items-center justify-between"><div className="text-sm font-semibold">Riwayat Pembayaran</div><Link href="/dashboard/member/pembayaran" className="text-xs text-[#C9A96A] font-medium">Lihat semua →</Link></div>
          <div className="mt-3 text-xs text-[#8A7D6B]">Total bayar: <span className="font-bold text-[#1C1610]">Rp {totalBayar.toLocaleString("id-ID")}</span> • {pembayaran.length} transaksi</div>
          <div className="mt-3 divide-y divide-[#F5F0E8] border border-[#F5F0E8] rounded-xl overflow-hidden">
            {pembayaran.length? pembayaran.slice(0,5).map((p:any)=>(<div key={p.id} className="flex items-center justify-between px-3 py-2.5 text-xs"><span className="text-[#6B5E4F]">{new Date(p.createdAt).toLocaleDateString("id-ID")} • {p.method}</span><span className={`rounded-full px-2 py-0.5 border text-[11px] font-medium ${p.status==="SUCCESS"?"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]": p.status==="PENDING"?"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]":"bg-white border-[#EDE6D6]"}`}>{p.status}</span><span className="font-semibold">Rp {p.amount.toLocaleString("id-ID")}</span></div>)) : <div className="px-3 py-4 text-xs text-[#8A7D6B]">Belum ada pembayaran.</div>}
          </div>
          {sewaAktif?.jatuhTempo && <div className="mt-3 rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-xs text-[#6B5E4F]">Jatuh tempo berikutnya <b className="text-[#1C1610]">{sewaAktif.jatuhTempo}</b> — {sewaAktif.sisaHari} hari lagi. <Link href="/dashboard/member/pembayaran" className="text-[#C9A96A] font-medium">Atur reminder</Link></div>}
        </div>

        {/* dilihat & favorit */}
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
          <div className="text-sm font-semibold">Dilihat & Favorit</div>
          <div className="mt-3 space-y-2">
            {dilihat.length? dilihat.map((k:any,i:number)=>(<div key={i} className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3"><div className="text-sm font-medium truncate">{k.nama||"-"}</div><div className="text-xs text-[#8A7D6B] truncate">{k.alamat||""}</div><div className="text-xs font-semibold">Rp {(k.harga||0).toLocaleString("id-ID")}/bln</div></div>)) : <p className="text-xs text-[#8A7D6B]">Belum ada histori dilihat.</p>}
          </div>
          <Link href="/kos/cari" className="mt-3 block rounded-xl bg-[#1C1610] text-white text-center py-2.5 text-xs font-medium">Cari Kos Lagi</Link>
        </div>
      </div>

      {/* rekomendasi */}
      <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
        <div className="flex items-center justify-between"><div className="text-sm font-semibold">Rekomendasi Untuk Kamu</div><span className="text-[11px] rounded-full bg-[#F5F0E8] border border-[#E8DCC8] px-2.5 py-1 text-[#8A7D6B]">Personal • budget-aware</span></div>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {rekomendasi.length? rekomendasi.map((k:any)=>(<Link key={k.id} href={`/kos/${k.slug}`} className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] overflow-hidden hover:border-[#C9A96A] transition-colors"><Image src={k.foto||`https://picsum.photos/seed/${k.slug}/300/180`} alt={k.nama || "kos"} width={300} height={180} className="h-28 w-full object-cover" unoptimized /><div className="p-3"><div className="text-sm font-semibold truncate">{k.nama}</div><div className="text-xs text-[#8A7D6B] truncate">{k.alamat}</div><div className="text-xs font-bold mt-1">Rp {(k.harga||0).toLocaleString("id-ID")}/bln</div></div></Link>)) : <p className="text-xs text-[#8A7D6B] col-span-3">Belum ada rekomendasi — mulai cari untuk dapat saran personal.</p>}
        </div>
      </div>

      {/* riwayat ringkas */}
      <div className="rounded-2xl bg-white border border-[#EDE6D6] p-5 shadow-soft">
        <div className="text-sm font-semibold">Riwayat Sewa</div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[#8A7D6B] border-b border-[#F5F0E8]"><th className="text-left py-2 font-medium">Kos</th><th className="text-left py-2 font-medium">Kamar</th><th className="text-right py-2 font-medium">Total</th><th className="text-center py-2 font-medium">Status</th><th className="text-right py-2 font-medium">Mulai</th></tr></thead>
            <tbody>{riwayat.length? riwayat.slice(0,6).map((r:any)=>(<tr key={r.id} className="border-b border-[#FDFBF7]"><td className="py-2 font-medium truncate max-w-[160px]">{r.kos}</td><td className="py-2">{r.kamar||"-"}</td><td className="py-2 text-right">Rp {(r.harga||0).toLocaleString("id-ID")}</td><td className="py-2 text-center"><span className="rounded-full border px-2 py-0.5 text-[11px] bg-[#FDFBF7] border-[#EDE6D6]">{r.status}</span></td><td className="py-2 text-right">{new Date(r.tglMulai).toLocaleDateString("id-ID")}</td></tr>)) : <tr><td colSpan={5} className="py-4 text-center text-[#8A7D6B]">Belum ada riwayat.</td></tr>}</tbody>
          </table>
        </div>
        <Link href="/dashboard/member/penyewaan" className="mt-3 inline-block text-xs font-medium text-[#C9A96A]">Lihat semua penyewaan →</Link>
      </div>
    </div>
  );
}
