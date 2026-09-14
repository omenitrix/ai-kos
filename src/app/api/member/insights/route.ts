import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const supa = createSupabaseService();

  // bookings + payments
  const [{ data: bookingsRaw }, { data: paymentsRaw }] = await Promise.all([
    supa.from("bookings").select("*").eq("penyewaId", userId).order("createdAt", { ascending: false }),
    supa.from("payments").select("*").eq("payerId", userId).order("createdAt", { ascending: false }),
  ]);

  const bookings = bookingsRaw || [];
  const payments = paymentsRaw || [];

  // enrich bookings with kos, kamar, payments
  let kosMap = new Map<string, any>();
  let kamarMap = new Map<string, any>();
  let paymentsByBooking = new Map<string, any[]>();

  if (bookings.length) {
    const kosIds = Array.from(new Set(bookings.map((b: any) => b.kosId))) as string[];
    const kamarIds = Array.from(new Set(bookings.map((b: any) => b.kamarId))) as string[];
    const bookingIds = bookings.map((b: any) => b.id);
    const [{ data: kosRows }, { data: kamarRows }, { data: payRows }] = await Promise.all([
      kosIds.length ? supa.from("kos_listings").select("*").in("id", kosIds) : Promise.resolve({ data: [] } as any),
      kamarIds.length ? supa.from("kamars").select("*").in("id", kamarIds) : Promise.resolve({ data: [] } as any),
      // also fetch kamar nested via kos for fallback but we have separate
      bookingIds.length ? supa.from("payments").select("*").in("bookingId", bookingIds) : Promise.resolve({ data: [] } as any),
    ]);
    // fetch kamars nested under kos for completeness (kamar list per kos)
    let kamarByKos = new Map<string, any[]>();
    if (kosIds.length) {
      const { data: allKamarsForKos } = await supa.from("kamars").select("*").in("kosId", kosIds);
      for (const k of (allKamarsForKos || [])) {
        const arr = kamarByKos.get(k.kosId) || [];
        arr.push(k);
        kamarByKos.set(k.kosId, arr);
      }
    }
    for (const k of (kosRows || [])) {
      // attach kamar array to kos
      (k as any).kamar = kamarByKos.get(k.id) || [];
      kosMap.set(k.id, k);
    }
    for (const k of (kamarRows || [])) kamarMap.set(k.id, k);
    for (const p of (payRows || [])) {
      const arr = paymentsByBooking.get(p.bookingId) || [];
      arr.push(p);
      paymentsByBooking.set(p.bookingId, arr);
    }
  }

  const enrichedBookings = bookings.map((b: any) => ({
    ...b,
    kos: kosMap.get(b.kosId) || null,
    kamar: kamarMap.get(b.kamarId) || null,
    payments: paymentsByBooking.get(b.id) || [],
  }));

  const active = enrichedBookings.find((b: any) => b.status === "ACTIVE" || b.status === "DRAFT");
  const riwayat = enrichedBookings;
  const totalBayar = payments.filter((p: any) => p.status === "SUCCESS").reduce((s: number, p: any) => s + p.amount, 0);

  let jatuhTempo: string | null = null;
  let sisaHari: number | null = null;
  if (active) {
    const start = new Date(active.tglMulai);
    const due = new Date(start);
    due.setMonth(due.getMonth() + (active.durasiBulan || 1));
    jatuhTempo = due.toISOString().slice(0, 10);
    sisaHari = Math.max(0, Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  const dilihat = enrichedBookings.slice(0, 3).map((b: any) => ({ nama: b.kos?.nama, alamat: b.kos?.alamat, harga: b.kamar?.hargaBulanan }));

  let avgPasar: number | null = null;
  if (active?.kos?.alamat) {
    const city = active.kos.alamat.split(",").pop()?.trim() || "";
    // fetch area kos
    const { data: areaKosRows } = city
      ? await supa.from("kos_listings").select("id,alamat").ilike("alamat", `%${city}%`)
      : await supa.from("kos_listings").select("id,alamat");
    const areaKosIds = (areaKosRows || []).map((k: any) => k.id);
    if (areaKosIds.length) {
      const { data: kamarArea } = await supa.from("kamars").select("hargaBulanan").in("kosId", areaKosIds);
      const arr = kamarArea || [];
      if (arr.length) avgPasar = Math.round(arr.reduce((s: number, k: any) => s + k.hargaBulanan, 0) / arr.length);
    }
  }

  // rekomendasi: kos lain dengan status AKTIF
  const { data: rekomRows } = await supa.from("kos_listings").select("id,slug,nama,alamat,fotoSampul").eq("status", "AKTIF").limit(10);
  let rekomendasi: any[] = [];
  if (rekomRows?.length) {
    const rekomIds = rekomRows.map((k: any) => k.id).filter((id: string) => id !== active?.kosId).slice(0, 3);
    const filtered = rekomRows.filter((k: any) => rekomIds.includes(k.id));
    if (rekomIds.length) {
      const { data: rekomKamars } = await supa.from("kamars").select("kosId,hargaBulanan").in("kosId", rekomIds);
      const kamarByKos2 = new Map<string, any>();
      for (const km of (rekomKamars || [])) if (!kamarByKos2.has(km.kosId)) kamarByKos2.set(km.kosId, km);
      rekomendasi = filtered.map((k: any) => ({
        id: k.id, slug: k.slug, nama: k.nama, alamat: k.alamat, harga: kamarByKos2.get(k.id)?.hargaBulanan ?? null, foto: k.fotoSampul,
      }));
    }
  }

  return NextResponse.json({
    sewaAktif: active ? { kos: active.kos?.nama, alamat: active.kos?.alamat, kamar: active.kamar?.nomor, harga: active.kamar?.hargaBulanan, tglMulai: active.tglMulai, tglSelesai: active.tglSelesai, status: active.status, jatuhTempo, sisaHari } : null,
    riwayat: riwayat.map((b: any) => ({ id: b.id, kos: b.kos?.nama, kamar: b.kamar?.nomor, harga: b.totalHarga, status: b.status, tglMulai: b.tglMulai })),
    pembayaran: payments.slice(0, 10).map((p: any) => ({ id: p.id, amount: p.amount, status: p.status, method: p.method, createdAt: p.createdAt })),
    totalBayar,
    dilihat,
    hargaArea: avgPasar ? { avgPasar, hargaSaya: active?.kamar?.hargaBulanan, selisih: active?.kamar?.hargaBulanan && avgPasar ? Math.round(((active.kamar.hargaBulanan - avgPasar) / avgPasar) * 100) : 0 } : null,
    rekomendasi,
  });
}
