"use client";
import { useCallback, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import dynamic from "next/dynamic";

const KosMap = dynamic(() => import("@/components/maps/kos-map"), { ssr: false, loading: () => <div className="h-[420px] w-full rounded-2xl border border-[#EDE6D6] bg-[#FDFBF7] grid place-items-center text-sm text-[#8A7D6B] lg:h-[520px]">Memuat peta…</div> });

function haversineKm(a: { lat:number; lng:number }, b: { lat:number; lng:number }) {
  const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLng=(b.lng-a.lng)*Math.PI/180;
  const s=Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}

export default function KosCari() {
  const [filters, setFilters] = useState({ q: "", minPrice: "", maxPrice: "", gender: "" });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState<{lat:number;lng:number}|null>(null);
  const [locStatus, setLocStatus] = useState<"idle"|"locating"|"ok"|"denied">("idle");
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [useRadius, setUseRadius] = useState(false);
  const [focusSlug, setFocusSlug] = useState<string|null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append("q", filters.q);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.gender) params.append("gender", filters.gender);
      const res = await fetch(`/api/kos?${params.toString()}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  },[filters.q, filters.minPrice, filters.maxPrice, filters.gender]);

  useEffect(() => { search(); }, [search]);

  const askLocation = () => {
    if (!navigator.geolocation) { setLocStatus("denied"); return; }
    setLocStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocStatus("ok"); setUseRadius(true); setSortByDistance(true); },
      () => setLocStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const pins = useMemo(() => {
    return results.filter(r=> r.latitude!=null && r.longitude!=null).map(r=> ({
      id: r.id, slug: r.slug, nama: r.nama, alamat: r.alamat,
      harga: r.kamar?.[0]?.hargaBulanan ?? 0,
      lat: Number(r.latitude), lng: Number(r.longitude),
    }));
  }, [results]);

  const filteredByRadius = useMemo(() => {
    if (!useRadius || !userLoc) return results;
    return results.filter(r=>{
      if (r.latitude==null||r.longitude==null) return false;
      const d = haversineKm(userLoc, { lat: Number(r.latitude), lng: Number(r.longitude) });
      return d <= radiusKm;
    });
  }, [results, useRadius, userLoc, radiusKm]);

  const sorted = useMemo(() => {
    if (!sortByDistance || !userLoc) return filteredByRadius;
    return [...filteredByRadius].sort((a,b)=>{
      if (a.latitude==null||a.longitude==null) return 1;
      if (b.latitude==null||b.longitude==null) return -1;
      return haversineKm(userLoc,{lat:Number(a.latitude),lng:Number(a.longitude)}) - haversineKm(userLoc,{lat:Number(b.latitude),lng:Number(b.longitude)});
    });
  }, [filteredByRadius, sortByDistance, userLoc]);

  const pinsFiltered = useMemo(() => {
    if (!useRadius || !userLoc) return pins;
    return pins.filter(p=> haversineKm(userLoc, {lat:p.lat, lng:p.lng}) <= radiusKm);
  }, [pins, useRadius, userLoc, radiusKm]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="serif text-[26px] leading-none">Cari Kos <span className="text-[#C9A96A]">—</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">Filter + peta lokasi • {results.length} kos ditemukan {userLoc? `• ${pinsFiltered.length} dalam ${radiusKm}km` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/owner/kos/add" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B] border border-[#E8DCC8] rounded-full px-3 py-1.5 bg-white">+ Tambah Kos (Owner)</Link>
        </div>
      </div>

      {/* Peta di atas */}
      <Card className="mb-6 overflow-hidden shadow-soft rounded-2xl border-[#EDE6D6]">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-sm">Peta Lokasi Kos</CardTitle>
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
                    <input type="checkbox" checked={useRadius} onChange={e=>setUseRadius(e.target.checked)} />
                    Radius
                  </label>
                  {useRadius && (
                    <select value={radiusKm} onChange={e=>setRadiusKm(Number(e.target.value))} className="rounded-full border border-[#E8DCC8] bg-white px-3 py-1.5 text-xs">
                      <option value={3}>3 km</option>
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={20}>20 km</option>
                      <option value={50}>50 km</option>
                    </select>
                  )}
                  <label className="flex items-center gap-2 text-xs border border-[#E8DCC8] rounded-full px-3 py-1.5 bg-white">
                    <input type="checkbox" checked={sortByDistance} onChange={e=>setSortByDistance(e.target.checked)} /> Urut terdekat
                  </label>
                  <Button variant="outline" size="sm" onClick={()=>{setUserLoc(null); setLocStatus("idle"); setUseRadius(false); setSortByDistance(false);}} className="rounded-full text-xs">Hapus lokasi</Button>
                </>
              )}
            </div>
          </div>
          <CardDescription className="text-xs">
            {locStatus==="denied" ? "Izin lokasi ditolak — aktifkan di pengaturan browser untuk fitur terdekat." : userLoc ? `Menampilkan kos dalam radius ${radiusKm} km dari lokasi kamu • pin emas = harga/bulan • klik pin untuk detail` : "Klik pin untuk lihat kos • aktifkan lokasi untuk cari kos terdekat & filter radius"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <KosMap pins={pinsFiltered.length? pinsFiltered : pins} userLoc={userLoc} onSelect={(p)=>setFocusSlug(p.slug)} focusSlug={focusSlug} />
          {pins.length===0 && !loading && <p className="p-4 text-center text-xs text-[#8A7D6B]">Belum ada kos dengan koordinat — tambah kos dengan latitude/longitude atau jalankan seed.</p>}
        </CardContent>
      </Card>

      {/* Filter */}
      <Card className="mb-6 rounded-2xl border-[#EDE6D6] shadow-soft">
        <CardHeader><CardTitle className="text-sm">Filter Pencarian</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Keyword (nama atau alamat)</Label>
              <Input value={filters.q} onChange={(e)=>setFilters({...filters, q:e.target.value})} placeholder="Misal: Sentosa, Cempaka, Jakarta" />
            </div>
            <div>
              <Label className="text-xs">Jenis Kamar</Label>
              <select value={filters.gender} onChange={(e)=>setFilters({...filters, gender:e.target.value})} className="w-full rounded-xl border border-[#E8DCC8] h-10 px-3 bg-white">
                <option value="">Semua</option>
                <option value="PUTRI">Kost Putri</option>
                <option value="CAMPUR">Kost Campur</option>
                <option value="PRIA">Kost Pria</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Harga Minimum (Rp)</Label>
              <Input type="number" value={filters.minPrice} onChange={(e)=>setFilters({...filters, minPrice:e.target.value})} placeholder="500000" />
            </div>
            <div>
              <Label className="text-xs">Harga Maksimum (Rp)</Label>
              <Input type="number" value={filters.maxPrice} onChange={(e)=>setFilters({...filters, maxPrice:e.target.value})} placeholder="3000000" />
            </div>
          </div>
          <Button onClick={search} className="w-full mt-2 rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416]">
            Cari Kos
          </Button>
        </CardContent>
      </Card>

      {/* Hasil */}
      {loading ? (
        <p className="text-center py-8 text-sm text-[#8A7D6B]">Mencari...</p>
      ) : sorted.length === 0 ? (
        <p className="text-center py-8 text-sm text-[#8A7D6B]">
          Tidak ada kos yang sesuai. {useRadius && userLoc ? `Coba perbesar radius ${radiusKm}km atau nonaktifkan filter radius.` : "Coba ubah kata kunci atau rentang harga."}
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((k) => {
            const dist = userLoc && k.latitude!=null && k.longitude!=null ? haversineKm(userLoc, {lat:Number(k.latitude), lng:Number(k.longitude)}) : null;
            const isFocused = focusSlug===k.slug;
            return (
            <Card key={k.id} className={`overflow-hidden rounded-2xl border-[#EDE6D6] shadow-soft hover:shadow-soft-lg transition-all ${isFocused?"ring-2 ring-[#C9A96A] border-[#C9A96A]":""}`}>
              <div className="relative">
                <Image src={k.fotoSampul || "https://picsum.photos/seed/kos/400/250"} alt={k.nama} width={400} height={192} className="h-48 w-full object-cover" unoptimized />
                {dist!=null && <span className="absolute left-3 top-3 rounded-full bg-[#1C1610] text-white px-2.5 py-1 text-xs font-medium">{dist.toFixed(1)} km dari kamu</span>}
              </div>
              <CardContent className="p-4">
                <CardTitle className="text-[15px] serif">{k.nama}</CardTitle>
                <CardDescription className="text-xs text-[#8A7D6B] line-clamp-1">{k.alamat}</CardDescription>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-[#C9A96A] text-sm">
                    Rp {k.kamar?.[0]?.hargaBulanan?.toLocaleString("id-ID") ?? 0}/bulan
                  </span>
                  <div className="flex gap-2">
                    {k.latitude!=null && <button onClick={()=>{setFocusSlug(k.slug); document.querySelector('[class*="h-[420px]"]')?.scrollIntoView({behavior:"smooth",block:"center"});}} className="rounded-full border border-[#E8DCC8] bg-white px-3 py-1.5 text-xs">📍 Peta</button>}
                    <Link href={`/kos/${k.slug}`}>
                      <Button size="sm" className="rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416] text-xs">Lihat Detail</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}
