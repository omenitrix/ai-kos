import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supa = createSupabaseService();
  const { data, error } = await supa.from("kamars").select("*").eq("kosId", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supa = createSupabaseService();
  const { data: kos } = await supa.from("kos_listings").select("*").eq("id", params.id).single();
  if (!kos) return NextResponse.json({ error: "Kos not found" }, { status: 404 });
  const role = (session.user as any).role;
  if (role !== "ADMIN" && kos.ownerId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.hargaBulanan || body.hargaBulanan < 100000) return NextResponse.json({ error: "Harga bulanan minimal 100.000" }, { status: 400 });
  const { data, error } = await supa.from("kamars").insert({ ...body, kosId: params.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
