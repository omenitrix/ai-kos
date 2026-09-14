import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/server";
import { recommendKos } from "@/lib/ai";

export async function POST(req: Request) {
  const { filters, limit = 6 } = await req.json();
  const supabase = createSupabaseService();
  const { data: kosList, error } = await supabase.from("kos_listings").select("*").eq("status", "AKTIF");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!kosList || kosList.length === 0) return NextResponse.json({ recommended: [] });
  const kosIds = (kosList as any[]).map((k) => k.id);
  const { data: kamars } = await supabase.from("kamars").select("*").in("kosId", kosIds);
  const kamarByKos = new Map<string, any[]>();
  for (const km of (kamars || []) as any[]) {
    const arr = kamarByKos.get(km.kosId) || [];
    arr.push(km);
    kamarByKos.set(km.kosId, arr);
  }
  const kos = (kosList as any[]).map((k) => ({ ...k, kamar: kamarByKos.get(k.id) || [] }));
  const recommended = recommendKos(filters, kos);
  return NextResponse.json({ recommended: recommended.slice(0, limit) });
}
