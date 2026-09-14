import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const supabase = createSupabaseService();
  const { data: threads, error } = await supabase
    .from("chat_threads")
    .select("*")
    .or(`memberId.eq.${userId},ownerId.eq.${userId}`)
    .order("updatedAt", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!threads || threads.length === 0) return NextResponse.json([]);

  const kosIds = Array.from(new Set((threads as any[]).map((t) => t.kosId).filter(Boolean)));
  const threadIds = (threads as any[]).map((t) => t.id);

  const [kosRes, msgRes] = await Promise.all([
    kosIds.length
      ? supabase.from("kos_listings").select("id,nama,slug").in("id", kosIds)
      : Promise.resolve({ data: [] } as any),
    threadIds.length
      ? supabase.from("chat_messages").select("*").in("threadId", threadIds).order("createdAt", { ascending: false })
      : Promise.resolve({ data: [] } as any),
  ]);

  const kosMap = new Map((kosRes.data || []).map((k: any) => [k.id, k]));
  // group messages by threadId, keep only last 1 per thread (most recent)
  const lastMsgByThread = new Map<string, any>();
  for (const m of (msgRes.data || []) as any[]) {
    if (!lastMsgByThread.has(m.threadId)) lastMsgByThread.set(m.threadId, m);
  }

  const enriched = (threads as any[]).map((t) => ({
    ...t,
    kos: kosMap.get(t.kosId) || null,
    messages: lastMsgByThread.has(t.id) ? [lastMsgByThread.get(t.id)] : [],
  }));
  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.kosId || !body.memberId || !body.content)
    return NextResponse.json({ error: "kosId, memberId, content required" }, { status: 400 });

  const supabase = createSupabaseService();
  const { data: kos } = await supabase.from("kos_listings").select("id,ownerId").eq("id", body.kosId).maybeSingle();
  if (!kos) return NextResponse.json({ error: "Kos not found" }, { status: 404 });

  const ownerId = (kos as any).ownerId;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (role !== "ADMIN" && body.memberId !== userId)
    return NextResponse.json({ error: "Forbidden: can only chat as yourself" }, { status: 403 });

  let { data: thread } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("kosId", body.kosId)
    .eq("memberId", body.memberId)
    .eq("ownerId", ownerId)
    .maybeSingle();

  if (!thread) {
    const { data: created, error } = await supabase
      .from("chat_threads")
      .insert({ kosId: body.kosId, memberId: body.memberId, ownerId })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    thread = created;
  }

  const { data: message, error: msgErr } = await supabase
    .from("chat_messages")
    .insert({ threadId: (thread as any).id, senderId: userId, content: body.content })
    .select()
    .single();
  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  await supabase.from("chat_threads").update({ updatedAt: new Date().toISOString() }).eq("id", (thread as any).id);

  return NextResponse.json({ thread, message });
}
