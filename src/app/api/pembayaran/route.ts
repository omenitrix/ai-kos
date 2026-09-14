import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGateway } from "@/lib/gateway";
import { genInvoiceNo } from "@/lib/utils";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const supa = createSupabaseService();

  try {
    let payments: any[] = [];
    let bookingIdsFilter: string[] | null = null;

    if (role === "OWNER") {
      const { data: kosList } = await supa.from("kos_listings").select("id").eq("ownerId", userId);
      const kosIds = (kosList || []).map((k: any) => k.id);
      if (kosIds.length === 0) return NextResponse.json([]);
      const { data: bookings } = await supa.from("bookings").select("id").in("kosId", kosIds);
      const bookingIds = (bookings || []).map((b: any) => b.id);
      if (bookingIds.length === 0) return NextResponse.json([]);
      bookingIdsFilter = bookingIds;
      const { data } = await supa.from("payments").select("*").in("bookingId", bookingIds).order("createdAt", { ascending: false });
      payments = data || [];
    } else if (role === "ADMIN") {
      const { data } = await supa.from("payments").select("*").order("createdAt", { ascending: false });
      payments = data || [];
    } else {
      const { data } = await supa.from("payments").select("*").eq("payerId", userId).order("createdAt", { ascending: false });
      payments = data || [];
    }

    if (payments.length === 0) return NextResponse.json([]);

    // enrich: booking -> kamar -> kos, penyewa, payer
    const bookingIds = Array.from(new Set(payments.map((p: any) => p.bookingId))) as string[];
    const payerIds = Array.from(new Set(payments.map((p: any) => p.payerId))) as string[];

    const [{ data: bookingRows }, { data: payerRows }] = await Promise.all([
      supa.from("bookings").select("*").in("id", bookingIds),
      payerIds.length ? supa.from("users").select("id,name,email").in("id", payerIds) : Promise.resolve({ data: [] } as any),
    ]);

    const bookingMap = new Map((bookingRows || []).map((b: any) => [b.id, b]));
    const payerMap = new Map((payerRows || []).map((u: any) => [u.id, u]));

    // fetch kamar & related kos + penyewa for bookings
    const kamarIds = Array.from(new Set((bookingRows || []).map((b: any) => b.kamarId))) as string[];
    const kosIds2 = Array.from(new Set((bookingRows || []).map((b: any) => b.kosId))) as string[];
    const penyewaIds = Array.from(new Set((bookingRows || []).map((b: any) => b.penyewaId))) as string[];

    const [{ data: kamarRows }, { data: kosRows }, { data: penyewaRows }] = await Promise.all([
      kamarIds.length ? supa.from("kamars").select("*, kos:kos_listings(*)").in("id", kamarIds) : Promise.resolve({ data: [] } as any),
      // kos fetch already via kamar.kos, but also direct kos
      kosIds2.length ? supa.from("kos_listings").select("*").in("id", kosIds2) : Promise.resolve({ data: [] } as any),
      penyewaIds.length ? supa.from("users").select("id,name,email").in("id", penyewaIds) : Promise.resolve({ data: [] } as any),
    ]);

    const kamarMap = new Map((kamarRows || []).map((k: any) => [k.id, k]));
    const kosMap = new Map((kosRows || []).map((k: any) => [k.id, k]));
    const penyewaMap = new Map((penyewaRows || []).map((u: any) => [u.id, u]));

    const enriched = payments.map((p: any) => {
      const booking = bookingMap.get(p.bookingId) as any;
      if (!booking) return { ...p, booking: null, payer: payerMap.get(p.payerId) || null };
      const kamar = kamarMap.get(booking.kamarId) || null;
      const kos = booking.kosId ? kosMap.get(booking.kosId) || (kamar as any)?.kos || null : (kamar as any)?.kos || null;
      const penyewa = penyewaMap.get(booking.penyewaId) || null;
      return {
        ...p,
        booking: { ...booking, kamar: kamar ? { ...kamar, kos } : null, penyewa },
        payer: payerMap.get(p.payerId) || null,
      };
    });

    return NextResponse.json(enriched);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

  const supa = createSupabaseService();
  const { data: booking, error: bookingErr } = await supa.from("bookings").select("*").eq("id", body.bookingId).single();
  if (bookingErr || !booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  // need kamar -> kos to check owner
  const { data: kamar } = await supa.from("kamars").select("*, kos:kos_listings(*)").eq("id", booking.kamarId).single();
  if (!kamar) return NextResponse.json({ error: "Booking kamar not found" }, { status: 404 });
  const kos = (kamar as any).kos;

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  if (role !== "ADMIN" && booking.penyewaId !== userId && kos?.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const amount = body.amount || booking.totalHarga;
  const method = body.method || "VIRTUAL_ACCOUNT";
  const paymentReq = { amount, orderId: booking.id, customerEmail: (session.user as any).email || "", method };
  const gatewayResp = await getGateway().createPayment(paymentReq);

  const payload: any = {
    bookingId: booking.id,
    payerId: userId,
    amount,
    method,
    status: (gatewayResp.status as any) || "PENDING",
    invoiceNo: genInvoiceNo(),
    buktiBayar: (gatewayResp as any).vaNumber || (gatewayResp as any).qrString || null,
  };

  const { data: payment, error: payErr } = await supa.from("payments").insert(payload).select().single();
  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });

  if (booking.status === "DRAFT") {
    await supa.from("bookings").update({ status: "PENDING_PAYMENT" }).eq("id", booking.id);
  }

  return NextResponse.json({ payment, ...gatewayResp });
}
