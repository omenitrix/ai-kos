import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supa = createSupabaseService();
    const { data: users, count } = await supa.from("users").select("email,role", { count: "exact" });
    const { count: kos } = await supa.from("kos_listings").select("id", { count: "exact", head: true });
    return NextResponse.json({ ok: true, users, kos, count, source: "supabase", env: { hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL, hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY, hasSecret: !!process.env.NEXTAUTH_SECRET } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
