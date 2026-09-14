import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

async function enrichOrders(supa: any, orders: any[]) {
  if (!orders.length) return orders;
  const serviceIds = Array.from(new Set(orders.map((o: any) => o.serviceId).filter(Boolean))) as string[];
  const buyerIds = Array.from(new Set(orders.map((o: any) => o.buyerId).filter(Boolean))) as string[];

  const [{ data: services }, { data: buyers }] = await Promise.all([
    serviceIds.length ? supa.from("marketplace_services").select("*").in("id", serviceIds) : Promise.resolve({ data: [] } as any),
    buyerIds.length ? supa.from("users").select("id,email,name,phone").in("id", buyerIds) : Promise.resolve({ data: [] } as any),
  ]);

  const svcMap = new Map((services || []).map((s: any) => [s.id, s]));
  const buyerMap = new Map((buyers || []).map((u: any) => [u.id, u]));

  const kosIds = Array.from(new Set((services || []).map((s: any) => (s as any).kosId).filter(Boolean))) as string[];
  let kosMap = new Map<string, any>();
  if (kosIds.length) {
    const { data: kosRows } = await supa.from("kos_listings").select("id,nama,slug").in("id", kosIds);
    for (const k of (kosRows || [])) kosMap.set(k.id, k);
  }

  return orders.map((o: any) => {
    const svc = svcMap.get(o.serviceId) || null;
    const svcEnriched = svc ? { ...svc, kos: (svc as any).kosId ? (kosMap.get((svc as any).kosId) ? { nama: kosMap.get((svc as any).kosId).nama, slug: kosMap.get((svc as any).kosId).slug } : null) : null } : null;
    return { ...o, service: svcEnriched, buyer: buyerMap.get(o.buyerId) || null };
  });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const supa = createSupabaseService();

  try {
    if (role === "ADMIN") {
      const { data: orders, error } = await supa.from("marketplace_orders").select("*").order("createdAt", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const enriched = await enrichOrders(supa, orders || []);
      return NextResponse.json(enriched);
    }
    if (role === "OWNER") {
      const { data: kosList } = await supa.from("kos_listings").select("id").eq("ownerId", userId);
      const ownedKosIds = (kosList || []).map((k: any) => k.id);
      if (!ownedKosIds.length) return NextResponse.json([]);
      const { data: services } = await supa.from("marketplace_services").select("id").in("kosId", ownedKosIds);
      const serviceIds = (services || []).map((s: any) => s.id);
      if (!serviceIds.length) return NextResponse.json([]);
      const { data: orders, error } = await supa.from("marketplace_orders").select("*").in("serviceId", serviceIds).order("createdAt", { ascending: false });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const enriched = await enrichOrders(supa, orders || []);
      return NextResponse.json(enriched);
    }
    // member/guest
    const { data: orders, error } = await supa.from("marketplace_orders").select("*").eq("buyerId", userId).order("createdAt", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const enriched = await enrichOrders(supa, orders || []);
    // member originally included service with kos but not buyer; keep enriched but buyer is self — preserve contract (orders array)
    return NextResponse.json(enriched);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const serviceId = body.serviceId;
  const qty = Math.max(1, Number(body.qty || 1));
  const catatan = body.catatan || null;
  if (!serviceId) return NextResponse.json({ error: "serviceId required" }, { status: 400 });

  const supa = createSupabaseService();
  const { data: svc, error } = await supa.from("marketplace_services").select("*").eq("id", serviceId).single();
  if (error || !svc || !svc.isActive) return NextResponse.json({ error: "Layanan tidak tersedia" }, { status: 404 });

  const totalHarga = svc.harga * qty;
  const { data: order, error: insErr } = await supa
    .from("marketplace_orders")
    .insert({ serviceId, buyerId: (session.user as any).id, qty, totalHarga, catatan })
    .select()
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  // include service
  return NextResponse.json({ ...order, service: svc });
}
