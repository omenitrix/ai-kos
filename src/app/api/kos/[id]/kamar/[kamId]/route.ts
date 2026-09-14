import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string; kamId: string } }) {
  const supa = createSupabaseService();
  const { data, error } = await supa.from("kamars").select("*").eq("id", params.kamId).eq("kosId", params.id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: { id: string; kamId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supa = createSupabaseService();
  const { data: kos } = await supa.from("kos_listings").select("*").eq("id", params.id).single();
  if (!kos) return NextResponse.json({ error: "Kos not found" }, { status: 404 });
  const role = (session.user as any).role;
  if (role !== "ADMIN" && kos.ownerId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { data, error } = await supa.from("kamars").update(body).eq("id", params.kamId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: { id: string; kamId: string } }) {
  return NextResponse.json({ error: "DELETE disabled (aturan: tidak menghapus file/data)" }, { status: 405 });
}
