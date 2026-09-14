import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can list transaksi" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const kosId = searchParams.get("kosId");
  const supabase = createSupabaseService();

  let payments: any[] | null = null;
  if (kosId) {
    const { data: bookings } = await supabase.from("bookings").select("id").eq("kosId", kosId);
    const bookingIds = (bookings || []).map((b: any) => b.id);
    if (bookingIds.length === 0) return NextResponse.json([]);
    const { data, error } = await supabase.from("payments").select("*").in("bookingId", bookingIds).order("createdAt", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    payments = data;
  } else {
    const { data, error } = await supabase.from("payments").select("*").order("createdAt", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    payments = data;
  }
  if (!payments || payments.length === 0) return NextResponse.json([]);
  const bookingIds = Array.from(new Set(payments.map((p: any) => p.bookingId).filter(Boolean)));
  const payerIds = Array.from(new Set(payments.map((p: any) => p.payerId).filter(Boolean)));
  const { data: bookings } = await supabase.from("bookings").select("*").in("id", bookingIds);
  const bookingMap = new Map((bookings || []).map((b: any) => [b.id, b]));
  const kosIds = Array.from(new Set((bookings || []).map((b: any) => b.kosId).filter(Boolean)));
  const kamarIds = Array.from(new Set((bookings || []).map((b: any) => b.kamarId).filter(Boolean)));
  const penyewaIds = Array.from(new Set((bookings || []).map((b: any) => b.penyewaId).filter(Boolean)));
  const [kosRes, kamarRes, penyewaRes, payerRes] = await Promise.all([
    kosIds.length ? supabase.from("kos_listings").select("*").in("id", kosIds) : Promise.resolve({ data: [] } as any),
    kamarIds.length ? supabase.from("kamars").select("*").in("id", kamarIds) : Promise.resolve({ data: [] } as any),
    penyewaIds.length ? supabase.from("users").select("id,name,email").in("id", penyewaIds) : Promise.resolve({ data: [] } as any),
    payerIds.length ? supabase.from("users").select("id,name,email").in("id", payerIds) : Promise.resolve({ data: [] } as any),
  ]);
  const kosMap = new Map((kosRes.data || []).map((k: any) => [k.id, k]));
  const kamarMap = new Map((kamarRes.data || []).map((k: any) => [k.id, k]));
  const penyewaMap = new Map((penyewaRes.data || []).map((u: any) => [u.id, u]));
  const payerMap = new Map((payerRes.data || []).map((u: any) => [u.id, u]));
  const enriched = payments.map((p: any) => {
    const booking = bookingMap.get(p.bookingId) || null;
    let bookingEnriched = booking ? { ...booking, kos: kosMap.get((booking as any).kosId) || null, kamar: kamarMap.get((booking as any).kamarId) || null, penyewa: penyewaMap.get((booking as any).penyewaId) || null } : null;
    return { ...p, booking: bookingEnriched, payer: payerMap.get(p.payerId) || null };
  });
  return NextResponse.json(enriched);
}
