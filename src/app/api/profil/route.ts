import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

function pickUser(u: any) {
  if (!u) return null;
  const { id, name, username, email, phone, photo, role, isVerified, isSuspended, createdAt } = u;
  return { id, name, username, email, phone, photo, role, isVerified, isSuspended, createdAt };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const sb = createSupabaseService();
  const { data: user, error } = await sb.from("users").select("*").eq("id", userId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pickUser(user));
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const sb = createSupabaseService();
  const body = await req.json();
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name.trim() || null;
  if (typeof body.username === "string") {
    const u = body.username.trim();
    if (u) {
      if (u.length < 3) return NextResponse.json({ error: "Username minimal 3 karakter" }, { status: 400 });
      const { data: exists } = await sb.from("users").select("id").eq("username", u).neq("id", userId).maybeSingle();
      if (exists) return NextResponse.json({ error: "Username sudah dipakai" }, { status: 400 });
      data.username = u;
    } else data.username = null;
  }
  if (typeof body.phone === "string") data.phone = body.phone.trim() || null;
  if (typeof body.photo === "string") data.photo = body.photo.trim() || null;
  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (email && email !== (session.user as any).email) {
      const { data: exists } = await sb.from("users").select("id").eq("email", email).maybeSingle();
      if (exists) return NextResponse.json({ error: "Email sudah dipakai" }, { status: 400 });
      data.email = email;
    }
  }
  if (!Object.keys(data).length) {
    const { data: cur } = await sb.from("users").select("*").eq("id", userId).maybeSingle();
    return NextResponse.json(pickUser(cur));
  }
  const { data: updated, error } = await sb.from("users").update(data).eq("id", userId).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { id, name, username, email, phone, photo, role, isVerified, createdAt } = updated as any;
  return NextResponse.json({ id, name, username, email, phone, photo, role, isVerified, createdAt });
}
