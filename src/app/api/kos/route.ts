import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const gender = searchParams.get("gender") || undefined;
  const supa = createSupabaseService();
  let query = supa.from("kos_listings").select("*, kamars(*), owner:users!kos_listings_ownerId_fkey(name,phone)").eq("status","AKTIF");
  if (gender) query = query.eq("genderType", gender);
  if (q) query = query.or(`nama.ilike.%${q}%,alamat.ilike.%${q}%`);
  const { data: listings, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let result = listings || [];
  if (q && result.length===0) {
    // already filtered via or, keep
  }
  if (minPrice || maxPrice) {
    result = result.filter((l:any) => {
      const prices = (l.kamars||[]).map((k:any)=>k.hargaBulanan);
      if (!prices.length) return false;
      const min = Math.min(...prices);
      return (!minPrice || min >= +minPrice) && (!maxPrice || min <= +maxPrice);
    });
  }
  // supabase returns .kamars -> alias as .kamar
  const mapped = result.map((l:any)=>({ ...l, kamar: l.kamars || [] }));
  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.user as any).role !== "OWNER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body?.nama || body.nama.length < 3) return NextResponse.json({ error: "Nama kos minimal 3 karakter" }, { status: 400 });
  if (!body?.alamat || body.alamat.length < 5) return NextResponse.json({ error: "Alamat minimal 5 karakter" }, { status: 400 });
  const supa = createSupabaseService();
  const { data, error } = await supa.from("kos_listings").insert({
    nama: body.nama,
    alamat: body.alamat,
    deskripsi: body.deskripsi ?? null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    fotoSampul: body.fotoSampul ?? null,
    fotoList: body.fotoList ?? [],
    video: body.video ?? null,
    genderType: body.genderType ?? "CAMPUR",
    ownerId: (session.user as any).id,
    slug: slugify(body.nama) + "-" + Date.now().toString(36),
    status: "PENDING_APPROVAL",
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
