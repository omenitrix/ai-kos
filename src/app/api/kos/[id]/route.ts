import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supa = createSupabaseService();
  // try id then slug
  let { data: kos } = await supa.from("kos_listings").select("*, kamars(*), promos(*), marketplace_services(*), owner:users!kos_listings_ownerId_fkey(name,phone,email)").eq("id", params.id).single();
  if (!kos) {
    const r = await supa.from("kos_listings").select("*, kamars(*), promos(*), marketplace_services(*), owner:users!kos_listings_ownerId_fkey(name,phone,email)").eq("slug", params.id).single();
    kos = r.data as any;
  }
  if (!kos) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const mapped:any = { ...kos, kamar: kos.kamars||[], promos: kos.promos||[], marketplace: kos.marketplace_services||[] };
  return NextResponse.json(mapped);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supa = createSupabaseService();
  const { data: kos } = await supa.from("kos_listings").select("*").eq("id", params.id).single();
  if (!kos) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const role = (session.user as any).role;
  if (role !== "ADMIN" && kos.ownerId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { data, error } = await supa.from("kos_listings").update({ nama: body.nama, alamat: body.alamat, deskripsi: body.deskripsi, latitude: body.latitude, longitude: body.longitude, fotoSampul: body.fotoSampul, fotoList: body.fotoList, video: body.video, genderType: body.genderType, status: body.status, isFeatured: body.isFeatured }).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ error: "DELETE disabled (aturan: tidak menghapus file/data)" }, { status: 405 });
}
