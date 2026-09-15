import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (s.user as any).id;
  const supa = createSupabaseService();
  const { data, error } = await supa.from("verifications").select("*").eq("userId", uid).order("createdAt", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (s.user as any).id;
  const body = await req.json();
  // body: { type: "KTP"|"SELFIE", fileUrl: string, nota?: string }
  if (!body.type || !["KTP", "SELFIE", "EMAIL", "PHONE"].includes(body.type)) return NextResponse.json({ error: "type KTP/SELFIE required" }, { status: 400 });
  if (!body.fileUrl) return NextResponse.json({ error: "fileUrl required — upload dulu via /api/uploadthing bucket=verifikasi" }, { status: 400 });
  const supa = createSupabaseService();
  const { data, error } = await supa.from("verifications").insert({
    userId: uid,
    type: body.type,
    fileUrl: body.fileUrl,
    nota: body.nota || null,
    status: "PENDING",
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
