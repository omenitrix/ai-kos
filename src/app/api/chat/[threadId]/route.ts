import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { threadId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createSupabaseService();
  const { data: thread, error } = await supabase.from("chat_threads").select("*").eq("id", params.threadId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const userId = (session.user as any).id;
  if ((thread as any).memberId !== userId && (thread as any).ownerId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [msgRes, kosRes] = await Promise.all([
    supabase.from("chat_messages").select("*").eq("threadId", params.threadId).order("createdAt", { ascending: true }),
    (thread as any).kosId
      ? supabase.from("kos_listings").select("nama,slug").eq("id", (thread as any).kosId).maybeSingle().then((r) => r.data)
      : Promise.resolve(null),
  ]);

  return NextResponse.json({ ...(thread as any), messages: msgRes.data || [], kos: kosRes });
}

export async function POST(req: Request, { params }: { params: { threadId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.content) return NextResponse.json({ error: "content required" }, { status: 400 });
  const supabase = createSupabaseService();
  const { data: thread } = await supabase.from("chat_threads").select("*").eq("id", params.threadId).maybeSingle();
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  const userId = (session.user as any).id;
  if ((thread as any).memberId !== userId && (thread as any).ownerId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({ threadId: params.threadId, senderId: userId, content: body.content })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("chat_threads").update({ updatedAt: new Date().toISOString() }).eq("id", params.threadId);
  return NextResponse.json(message);
}
