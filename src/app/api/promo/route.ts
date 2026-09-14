import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kosId = searchParams.get("kosId");
  const supa = createSupabaseService();
  let q = supa.from("promos").select("*, kos:kos_listings!promos_kosId_fkey(nama,slug)").eq("isActive", true).order("masaBerlakuAkhir", { ascending: false });
  if (kosId) q = q.eq("kosId", kosId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "OWNER" && role !== "ADMIN") return NextResponse.json({ error: "Only owner/admin can create promo" }, { status: 403 });
  const body = await req.json();
  if (!body.kosId) return NextResponse.json({ error: "kosId required" }, { status: 400 });
  const supa = createSupabaseService();
  const { data: kos } = await supa.from("kos_listings").select("*").eq("id", body.kosId).single();
  if (!kos) return NextResponse.json({ error: "Kos not found" }, { status: 404 });
  if (role !== "ADMIN" && kos.ownerId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = await supa.from("promos").insert({ ...body, kosId: body.kosId }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
