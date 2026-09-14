import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/server";
import { hargaPasar } from "@/lib/ai";

export async function POST(req: Request) {
  const { area } = await req.json();
  if (!area) return NextResponse.json({ error: "area required" }, { status: 400 });
  const supabase = createSupabaseService();
  const { data: kosList, error } = await supabase.from("kos_listings").select("*").eq("status", "AKTIF");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!kosList || kosList.length === 0) {
    return NextResponse.json(hargaPasar(area, []));
  }
  const kosIds = (kosList as any[]).map((k) => k.id);
  const { data: kamars } = await supabase.from("kamars").select("*").in("kosId", kosIds);
  const kamarByKos = new Map<string, any[]>();
  for (const km of (kamars || []) as any[]) {
    const arr = kamarByKos.get(km.kosId) || [];
    arr.push(km);
    kamarByKos.set(km.kosId, arr);
  }
  const kos = (kosList as any[]).map((k) => ({ ...k, kamar: kamarByKos.get(k.id) || [] }));
  const data = hargaPasar(area, kos);
  return NextResponse.json(data);
}
