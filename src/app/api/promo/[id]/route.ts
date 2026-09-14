import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supa = createSupabaseService();
  const { data, error } = await supa.from("promos").select("*, kos:kos_listings!promos_kosId_fkey(nama,slug)").eq("id", params.id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "OWNER" && role !== "ADMIN") return NextResponse.json({ error: "Only owner/admin can update promo" }, { status: 403 });
  const supa = createSupabaseService();
  const { data: promo } = await supa.from("promos").select("*").eq("id", params.id).single();
  if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (promo.kosId) {
    const { data: kos } = await supa.from("kos_listings").select("*").eq("id", promo.kosId).single();
    if (kos && role !== "ADMIN" && kos.ownerId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { data, error } = await supa.from("promos").update(body).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ error: "DELETE disabled (aturan: tidak menghapus file/data)" }, { status: 405 });
}
