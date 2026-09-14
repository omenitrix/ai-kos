import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const supa = createSupabaseService();

  try {
    let bookings: any[] = [];

    if (role === "OWNER") {
      const { data: kosList } = await supa.from("kos_listings").select("id").eq("ownerId", userId);
      const kosIds = (kosList || []).map((k: any) => k.id);
      if (kosIds.length === 0) return NextResponse.json([]);
      const { data } = await supa.from("bookings").select("*").in("kosId", kosIds).order("createdAt", { ascending: false });
      bookings = data || [];
    } else if (role === "ADMIN") {
      const { data } = await supa.from("bookings").select("*").order("createdAt", { ascending: false });
      bookings = data || [];
    } else {
      const { data } = await supa.from("bookings").select("*").eq("penyewaId", userId).order("createdAt", { ascending: false });
      bookings = data || [];
    }

    if (bookings.length === 0) return NextResponse.json([]);

    // batch fetch relations
    const kosIds2 = Array.from(new Set(bookings.map((b: any) => b.kosId))) as string[];
    const kamarIds = Array.from(new Set(bookings.map((b: any) => b.kamarId))) as string[];
    const penyewaIds = Array.from(new Set(bookings.map((b: any) => b.penyewaId))) as string[];

    const [{ data: kosRows }, { data: kamarRows }, { data: userRows }] = await Promise.all([
      kosIds2.length ? supa.from("kos_listings").select("*").in("id", kosIds2) : Promise.resolve({ data: [] } as any),
      kamarIds.length ? supa.from("kamars").select("*").in("id", kamarIds) : Promise.resolve({ data: [] } as any),
      penyewaIds.length ? supa.from("users").select("id,name,email,photo").in("id", penyewaIds) : Promise.resolve({ data: [] } as any),
    ]);

    const kosMap = new Map((kosRows || []).map((k: any) => [k.id, k]));
    const kamarMap = new Map((kamarRows || []).map((k: any) => [k.id, k]));
    const userMap = new Map((userRows || []).map((u: any) => [u.id, u]));

    const enriched = bookings.map((b: any) => ({
      ...b,
      kos: kosMap.get(b.kosId) || null,
      kamar: kamarMap.get(b.kamarId) || null,
      penyewa: userMap.get(b.penyewaId) || null,
    }));

    return NextResponse.json(enriched);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "MEMBER" && role !== "OWNER") return NextResponse.json({ error: "Only member/owner can create booking" }, { status: 403 });
  const body = await req.json();
  if (!body.kosId || !body.kamarId || !body.tglMulai) return NextResponse.json({ error: "kosId, kamarId, tglMulai required" }, { status: 400 });

  const supa = createSupabaseService();
  const { data: kamar, error: kamarErr } = await supa.from("kamars").select("*").eq("id", body.kamarId).single();
  if (kamarErr || !kamar) return NextResponse.json({ error: "Kamar not found" }, { status: 404 });
  if (!kamar.tersedia) return NextResponse.json({ error: "Kamar tidak tersedia" }, { status: 400 });

  const totalHarga = kamar.hargaBulanan * (body.durasiBulan || 1);
  const payload: any = {
    kosId: body.kosId,
    kamarId: body.kamarId,
    penyewaId: (session.user as any).id,
    tglMulai: new Date(body.tglMulai).toISOString(),
    durasiBulan: body.durasiBulan || 1,
    totalHarga,
    status: "DRAFT",
  };
  if (body.tglSelesai) payload.tglSelesai = new Date(body.tglSelesai).toISOString();

  const { data, error } = await supa.from("bookings").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
