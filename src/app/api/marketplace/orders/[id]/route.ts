import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

const ALLOWED = ["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED", "REFUNDED"] as const;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const supa = createSupabaseService();

  const { data: order, error: orderErr } = await supa.from("marketplace_orders").select("*").eq("id", params.id).single();
  if (orderErr || !order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: service } = await supa.from("marketplace_services").select("*").eq("id", order.serviceId).single();
  const orderWithService = { ...order, service } as any;

  const body = await req.json();
  const newStatus = body.status;
  if (!ALLOWED.includes(newStatus)) return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });

  if (role === "ADMIN") {
    // admin can do anything
  } else if (role === "OWNER") {
    if (!service?.kosId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { data: kos } = await supa.from("kos_listings").select("id,ownerId").eq("id", service.kosId).single();
    if (!kos || kos.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else {
    if (order.buyerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!(order.status === "PENDING" && newStatus === "CANCELLED")) {
      return NextResponse.json({ error: "Kamu hanya bisa membatalkan pesanan yang masih pending" }, { status: 403 });
    }
  }

  const { data: updated, error } = await supa.from("marketplace_orders").update({ status: newStatus }).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // enrich response: include service + buyer
  const [{ data: svc2 }, { data: buyer }] = await Promise.all([
    supa.from("marketplace_services").select("*").eq("id", updated.serviceId).single(),
    supa.from("users").select("id,email,name").eq("id", updated.buyerId).single(),
  ]);

  return NextResponse.json({ ...updated, service: svc2 || service, buyer: buyer || null });
}
