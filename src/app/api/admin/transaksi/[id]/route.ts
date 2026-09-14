import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const body = await req.json();
  const status = body.status;
  if (!["PENDING","SUCCESS","FAILED","REFUNDED"].includes(status)) return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  const supabase = createSupabaseService();
  const { data: existing } = await supabase.from("payments").select("id").eq("id", params.id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  const { data: updated, error } = await supabase.from("payments").update({ status, verifiedAt: status === "SUCCESS" ? new Date().toISOString() : null, updatedAt: new Date().toISOString() }).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // enrich with booking/kos/kamar/payer like before
  const { data: booking } = await supabase.from("bookings").select("*").eq("id", (updated as any).bookingId).maybeSingle();
  let kos = null, kamar = null;
  if (booking) {
    const [kosRes, kamarRes] = await Promise.all([
      supabase.from("kos_listings").select("nama,slug").eq("id", (booking as any).kosId).maybeSingle().then(r=>r.data),
      supabase.from("kamars").select("*").eq("id", (booking as any).kamarId).maybeSingle().then(r=>r.data),
    ]);
    kos = kosRes; kamar = kamarRes;
  }
  const { data: payer } = await supabase.from("users").select("email,name").eq("id", (updated as any).payerId).maybeSingle();
  return NextResponse.json({ ...updated, booking: booking ? { ...booking, kos, kamar } : null, payer });
}
