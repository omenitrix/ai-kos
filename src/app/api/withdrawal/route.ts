import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

// GET — owner lihat saldo + riwayat penarikan (dari admin_logs targetType WITHDRAWAL)
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (s.user as any).id;
  const role = (s.user as any).role;
  if (role !== "OWNER" && role !== "ADMIN") return NextResponse.json({ error: "Only owner" }, { status: 403 });
  const supa = createSupabaseService();
  try {
    // hitung saldo: sum payments SUCCESS untuk kos milik owner - sum withdrawal APPROVED
    let kosIds: string[] = [];
    if (role === "OWNER") {
      const { data: kosList } = await supa.from("kos_listings").select("id").eq("ownerId", uid);
      kosIds = (kosList || []).map((k: any) => k.id);
    } else {
      // admin lihat semua
      const { data: kosList } = await supa.from("kos_listings").select("id");
      kosIds = (kosList || []).map((k: any) => k.id);
    }
    let totalMasuk = 0;
    if (kosIds.length) {
      const { data: bookings } = await supa.from("bookings").select("id").in("kosId", kosIds);
      const bookingIds = (bookings || []).map((b: any) => b.id);
      if (bookingIds.length) {
        const { data: pays } = await supa.from("payments").select("amount,status").in("bookingId", bookingIds).eq("status", "SUCCESS");
        for (const p of (pays || []) as any[]) totalMasuk += Number(p.amount) || 0;
      }
    }
    // withdrawals dari admin_logs
    const q = supa.from("admin_logs").select("*").eq("targetType", "WITHDRAWAL").order("createdAt", { ascending: false }).limit(50);
    const { data: logs } = role === "OWNER" ? await q.eq("adminId", uid) : await q;
    // adminId di sini kita pakai sebagai ownerId pemohon (karena admin_logs butuh adminId) — simpan pemohon di keterangan JSON
    let totalKeluar = 0;
    const riwayat: any[] = [];
    for (const l of (logs || []) as any[]) {
      try {
        const meta = JSON.parse(l.keterangan || "{}");
        const amount = Number(meta.amount) || 0;
        const status = meta.status || "PENDING";
        if (status === "APPROVED") totalKeluar += amount;
        riwayat.push({ id: l.id, amount, status, createdAt: l.createdAt, keterangan: l.keterangan, meta, action: l.action });
      } catch { riwayat.push(l); }
    }
    const saldo = Math.max(0, totalMasuk - totalKeluar);
    return NextResponse.json({ saldo, totalMasuk, totalKeluar, riwayat });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — ajukan penarikan { amount, rekening, bank }
export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (s.user as any).id;
  const role = (s.user as any).role;
  if (role !== "OWNER" && role !== "ADMIN") return NextResponse.json({ error: "Only owner" }, { status: 403 });
  const body = await req.json();
  const amount = Number(body.amount);
  if (!amount || amount < 50000) return NextResponse.json({ error: "Minimal penarikan Rp 50.000" }, { status: 400 });
  const supa = createSupabaseService();
  // cek saldo dulu
  // hitung langsung
  let kosIds: string[] = [];
  const { data: kosList } = await supa.from("kos_listings").select("id").eq("ownerId", uid);
  kosIds = (kosList || []).map((k: any) => k.id);
  let totalMasuk = 0;
  if (kosIds.length) {
    const { data: bookings } = await supa.from("bookings").select("id").in("kosId", kosIds);
    const bookingIds = (bookings || []).map((b: any) => b.id);
    if (bookingIds.length) {
      const { data: pays } = await supa.from("payments").select("amount").in("bookingId", bookingIds).eq("status", "SUCCESS");
      for (const p of (pays || []) as any[]) totalMasuk += Number(p.amount) || 0;
    }
  }
  const { data: logs } = await supa.from("admin_logs").select("keterangan").eq("targetType", "WITHDRAWAL").eq("adminId", uid);
  let totalKeluar = 0;
  for (const l of (logs || []) as any[]) { try { const m = JSON.parse(l.keterangan); if (m.status === "APPROVED") totalKeluar += Number(m.amount) || 0; } catch {} }
  const saldo = Math.max(0, totalMasuk - totalKeluar);
  if (amount > saldo) return NextResponse.json({ error: `Saldo tidak cukup. Saldo Rp ${saldo.toLocaleString("id-ID")}` }, { status: 400 });

  const meta = { amount, bank: body.bank || "", rekening: body.rekening || "", ownerId: uid, email: (s.user as any).email, status: "PENDING", requestedAt: new Date().toISOString() };
  const { data, error } = await supa.from("admin_logs").insert({
    adminId: uid,
    action: "WITHDRAWAL_REQUEST",
    targetType: "WITHDRAWAL",
    targetId: uid,
    keterangan: JSON.stringify(meta),
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, log: data, saldoAfter: saldo - amount });
}
