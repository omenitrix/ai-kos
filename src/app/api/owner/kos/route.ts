import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  if (role !== "OWNER" && role !== "ADMIN") return NextResponse.json({ error: "Forbidden — hanya OWNER" }, { status: 403 });
  const supa = createSupabaseService();
  let query = supa.from("kos_listings").select("*, kamars(id,hargaBulanan)").order("createdAt", { ascending: false });
  if (role !== "ADMIN") query = query.eq("ownerId", userId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const mapped = (data||[]).map((l:any)=>({ ...l, kamar: l.kamars||[] }));
  return NextResponse.json(mapped);
}
