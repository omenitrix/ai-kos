import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supa = createSupabaseService();
  const { data: booking, error } = await supa.from("bookings").select("*").eq("id", params.id).single();
  if (error || !booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // fetch relations
  const [kosRes, kamarRes, penyewaRes, payRes] = await Promise.all([
    supa.from("kos_listings").select("*").eq("id", booking.kosId).single(),
    supa.from("kamars").select("*").eq("id", booking.kamarId).single(),
    supa.from("users").select("id,name,email,photo").eq("id", booking.penyewaId).single(),
    supa.from("payments").select("*").eq("bookingId", booking.id),
  ]);

  const kos = kosRes.data || null;
  const kamar = kamarRes.data || null;
  const penyewa = penyewaRes.data || null;
  const payments = payRes.data || [];

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const ownerId = kos?.ownerId;
  if (role !== "ADMIN" && booking.penyewaId !== userId && ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ...booking, kos, kamar, penyewa, payments });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supa = createSupabaseService();
  const { data: booking, error } = await supa.from("bookings").select("*").eq("id", params.id).single();
  if (error || !booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  // need kos to check ownership
  const { data: kos } = await supa.from("kos_listings").select("ownerId").eq("id", booking.kosId).single();
  if (role !== "ADMIN" && booking.penyewaId !== userId && kos?.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  if (body.status) {
    const allowed = ["PENDING_PAYMENT", "ACTIVE", "SELESAI", "DIBATALKAN"];
    if (!allowed.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  // only allow updating known columns
  const allowedFields = ["status", "tglSelesai", "tglMulai", "durasiBulan", "totalHarga", "isBlacklisted"];
  const updateData: any = {};
  for (const k of allowedFields) if (body[k] !== undefined) updateData[k] = body[k];
  // also allow generic but filtered body if contains status etc, fallback to body status-only
  if (Object.keys(updateData).length === 0 && body.status) updateData.status = body.status;

  const { data: updated, error: updErr } = await supa.from("bookings").update(updateData).eq("id", params.id).select().single();
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  return NextResponse.json(updated);
}
