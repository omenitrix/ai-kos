"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const KosMap = dynamic(() => import("@/components/maps/kos-map"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full rounded-2xl border border-[#EDE6D6] bg-[#FDFBF7] grid place-items-center text-sm text-[#8A7D6B]">Memuat peta…</div>,
});

function haversineKm(a: { lat:number; lng:number }, b: { lat:number; lng:number }) {
  const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLng=(b.lng-a.lng)*Math.PI/180;
  const s=Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}
function parseBudget(q: string): number | null {
  const m = q.match(/(\d+[\.,]?\d*)\s*(jt|juta|rb|ribu|k)?/i);
  if (!m) {
    const n = q.match(/(\d{6,8})/);
    if (n) return parseInt(n[1].replace(/\D/g,""),10);
    return null;
  }
  let num = parseFloat(m[1].replace(",","."));
  const unit = (m[2]||"").toLowerCase();
  if (unit.includes("jt") || unit.includes("juta")) num *= 1000000;
  else if (unit.includes("rb") || unit.includes("ribu") || unit==="k") num *= 1000;
  else if (num < 5000) num *= 1000000; // "1.5" -> 1.5jt
  return Math.round(num);
}

export default function AIPage() {
  const [q,setQ]=useState("Cari kos 1 jutaan dekat kampus yang ada AC dan WiFi");
  const [ans,setAns]=useState("");
  const [harga,setHarga]=useState<any>(null);
  const [reco,setReco]=useState<any[]>([]);
  const [loadingReco,setLoadingReco]=useState(false);
  const [userLoc,setUserLoc]=useState<{lat:number;lng:number}|null>(null);
  const [locStatus,setLocStatus]=useState<"idle"|"locating"|"ok"|"denied">("idle");
  const [radiusKm,setRadiusKm]=useState(10);
  const [useRadius,setUseRadius]=useState(false);
  const [focusSlug,setFocusSlug]=useState<string|null>(null);

  async function ask() {
    setAns("Memanggil AI...");
    setFocusSlug(null);
    try {
      const r = await fetch("/api/ai/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q})});
      const d = await r.json();
      setAns(d.reply || d.error || JSON.stringify(d));
    } catch(e:any){ setAns("Gagal hubungi AI: "+e.message); }

    // rekomendasi + peta
    setLoadingReco(true);
    try {
      const budget = parseBudget(q) || 1500000;
      const rr = await fetch("/api/ai/rekomendasi",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filters:{budget}, limit: 12})});
      const dd = await rr.json();
      const list = dd.recommended || dd.data || [];
      setReco(Array.isArray(list)?list:[]);
    } catch { setReco([]); }
    finally { setLoadingReco(false); }
  }

  async function cekHarga() {
    const r = await fetch("/api/ai/harga",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({area:"Jakarta Selatan"})});
    setHarga(await r.json());
  }

  const askLocation = () => {
    if (!navigator.geolocation) { setLocStatus("denied"); return; }
    setLocStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos)=>{ setUserLoc({lat:pos.coords.latitude,lng:pos.coords.longitude}); setLocStatus("ok"); setUseRadius(true); },
      ()=> setLocStatus("denied"),
      { enableHighAccuracy:true, timeout:8000 }
    );
  };

  const pins = useMemo(()=> reco.filter((r:any)=> r.latitude!=null && r.longitude!=null).map((r:any)=>({
    id:r.id, slug:r.slug, nama:r.nama, alamat:r.alamat, harga: r.kamar?.[0]?.hargaBulanan ?? 0, lat:Number(r.latitude), lng:Number(r.longitude)
  })), [reco]);

  const pinsFiltered = useMemo(()=>{
    if (!useRadius || !userLoc) return pins;
    return pins.filter(p=> haversineKm(userLoc,{lat:p.lat,lng:p.lng}) <= radiusKm);
  }, [pins,useRadius,userLoc,radiusKm]);

  const recoFiltered = useMemo(()=>{
    if (!useRadius || !userLoc) return reco;
    return reco.filter((r:any)=> r.latitude!=null && r.longitude!=null && haversineKm(userLoc,{lat:Number(r.latitude),lng:Number(r.longitude)}) <= radiusKm);
  }, [reco,useRadius,userLoc,radiusKm]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="serif text-[26px] leading-none">AI Concierge <span className="text-[#C9A96A]">—</span></h1>
        <p className="text-sm text-[#8A7D6B] mt-1">Tanya kos dengan bahasa natural — hasil rekomendasi langsung tampil di peta</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Chatbot — tanya kos / FAQ</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Pesan kamu</Label><Textarea value={q} onChange={e=>setQ(e.target.value)} rows={3} className="mt-1" placeholder="Misal: cari kos 1,5jt dekat UI AC WiFi" /></div>
            <div className="flex gap-2">
              <Button onClick={ask} className="rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416]">Kirim ke AI</Button>
              <Button variant="outline" onClick={()=>{setReco([]); setAns(""); setFocusSlug(null);}} className="rounded-full">Reset</Button>
            </div>
            {ans && <p className="rounded-2xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-sm whitespace-pre-wrap leading-relaxed">{ans}</p>}
            {loadingReco && <p className="text-xs text-[#8A7D6B]">Mencari rekomendasi & menyiapkan peta…</p>}
            <p className="text-xs text-[#B8A99A]">Provider: mock heuristik (isi <b>AI_PROVIDER_API_KEY</b> untuk LLM nyata) — endpoint <code>/api/ai/chat</code> & <code>/api/ai/rekomendasi</code>.</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Analisa Harga Pasar & Prediksi</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" onClick={cekHarga} className="rounded-full border-[#E8DCC8]">Hitung Harga Pasar (Jakarta Selatan)</Button>
            {harga && <pre className="rounded-2xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-xs overflow-auto">{JSON.stringify(harga,null,2)}</pre>}
            <p className="text-xs text-[#B8A99A]">Prediksi kamar kosong & pendapatan pakai heuristik sederhana — siap ganti model ML nanti.</p>
            <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-4 text-white">
              <div className="text-xs font-medium flex items-center gap-2">✦ Tip AI</div>
              <p className="text-xs leading-relaxed text-[#E8DCC8] mt-1">Coba tanya: “kos putri di Bandung 2jt” atau “kos dekat kampus 1 juta” — AI akan cari & tampilkan di peta sebelah.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAPS RECOMMENDATION */}
      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm">Peta Rekomendasi AI</CardTitle>
              <p className="text-xs text-[#8A7D6B] mt-1">{reco.length? `${pinsFiltered.length} kos di peta${useRadius&&userLoc?` dalam ${radiusKm}km dari kamu`:""} • pin emas = harga/bulan • klik pin untuk detail` : "Kirim pertanyaan ke AI dulu — pin emas akan muncul di sini"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!userLoc ? (
                <Button size="sm" onClick={askLocation} className="rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416] text-xs">
                  {locStatus==="locating" ? "Mencari lokasi…" : "📍 Gunakan lokasi saya"}
                </Button>
              ) : (
                <span className="rounded-full bg-[#EAF6EC] border border-[#C8E6C9] px-3 py-1 text-xs text-[#2E7D32]">📍 {userLoc.lat.toFixed(4)}, {userLoc.lng.toFixed(4)}</span>
              )}
              {userLoc && (
                <>
                  <label className="flex items-center gap-2 text-xs border border-[#E8DCC8] rounded-full px-3 py-1.5 bg-[#FDFBF7]">
                    <input type="checkbox" checked={useRadius} onChange={e=>setUseRadius(e.target.checked)} /> Radius
                  </label>
                  {useRadius && (
                    <select value={radiusKm} onChange={e=>setRadiusKm(Number(e.target.value))} className="rounded-full border border-[#E8DCC8] bg-white px-3 py-1.5 text-xs">
                      <option value={3}>3 km</option><option value={5}>5 km</option><option value={10}>10 km</option><option value={20}>20 km</option><option value={50}>50 km</option>
                    </select>
                  )}
                  <Button variant="outline" size="sm" onClick={()=>{setUserLoc(null); setLocStatus("idle"); setUseRadius(false);}} className="rounded-full text-xs">Hapus lokasi</Button>
                </>
              )}
            </div>
          </div>
          {locStatus==="denied" && <p className="text-xs text-[#8A6D1E] bg-[#FFF3E0] border border-[#FFE0B2] rounded-xl px-3 py-2 mt-2">Izin lokasi ditolak — aktifkan di pengaturan browser untuk filter terdekat.</p>}
        </CardHeader>
        <CardContent className="p-0">
          <KosMap pins={pinsFiltered} userLoc={userLoc} onSelect={(p)=>setFocusSlug(p.slug)} focusSlug={focusSlug} />
        </CardContent>
        {recoFiltered.length > 0 && (
          <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#FDFBF7] border-t border-[#EDE6D6]">
            {recoFiltered.slice(0,6).map((k:any)=>{
              const dist = userLoc && k.latitude!=null ? haversineKm(userLoc,{lat:Number(k.latitude),lng:Number(k.longitude)}) : null;
              const isFocused = focusSlug===k.slug;
              return (
                <div key={k.id} className={`rounded-2xl border bg-white p-3 shadow-soft flex gap-3 ${isFocused?"border-[#C9A96A] ring-2 ring-[#C9A96A]/20":"border-[#EDE6D6]"}`}>
                  <img src={k.fotoSampul || `https://picsum.photos/seed/${k.slug}/120/120`} alt={k.nama} className="h-16 w-16 rounded-xl object-cover border border-[#EDE6D6] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{k.nama}</div>
                    <div className="text-xs text-[#8A7D6B] truncate">{k.alamat}</div>
                    <div className="text-xs font-bold text-[#C9A96A] mt-0.5">Rp {(k.kamar?.[0]?.hargaBulanan ?? 0).toLocaleString("id-ID")}/bln {dist!=null && <span className="font-normal text-[#8A7D6B]">• {dist.toFixed(1)}km</span>}</div>
                    <div className="mt-1 flex gap-1.5">
                      <Link href={`/kos/${k.slug}`} className="rounded-full bg-[#1C1610] text-white px-2.5 py-1 text-[11px]">Detail</Link>
                      <button onClick={()=>setFocusSlug(k.slug)} className="rounded-full border border-[#E8DCC8] bg-white px-2.5 py-1 text-[11px]">📍 Peta</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
