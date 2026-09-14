import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supa = createSupabaseService();
  const { data: payment, error } = await supa.from("payments").select("*").eq("id", params.id).single();
  if (error || !payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: booking } = await supa.from("bookings").select("*").eq("id", payment.bookingId).single();
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [kosRes, kamarRes, payerRes] = await Promise.all([
    supa.from("kos_listings").select("*").eq("id", booking.kosId).single(),
    supa.from("kamars").select("*").eq("id", booking.kamarId).single(),
    supa.from("users").select("id,name,email,photo").eq("id", payment.payerId).single(),
  ]);

  const kos = kosRes.data || null;
  const kamar = kamarRes.data || null;
  const payer = payerRes.data || null;

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  if (role !== "ADMIN" && payment.payerId !== userId && kos?.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ...payment, booking: { ...booking, kos, kamar }, payer });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can verify payment" }, { status: 403 });

  const supa = createSupabaseService();
  const { data: payment } = await supa.from("payments").select("*").eq("id", params.id).single();
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updateData: any = { status: body.status };
  updateData.verifiedAt = body.status === "SUCCESS" ? new Date().toISOString() : null;

  const { data: updated, error } = await supa.from("payments").update(updateData).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.status === "SUCCESS") {
    await supa.from("bookings").update({ status: "ACTIVE" }).eq("id", payment.bookingId);
  }
  return NextResponse.json(updated);
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supa = createSupabaseService();
  const { data: payment } = await supa.from("payments").select("*").eq("id", params.id).single();
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const userId = (session.user as any).id;
  if (payment.payerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: updated, error } = await supa.from("payments").update({ buktiBayar: "mock-upload-url" }).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(updated);
}
