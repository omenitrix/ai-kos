"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function KosChat() {
  const params = useParams() as { slug: string };
  const slug = params.slug;
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const [kos, setKos] = useState<any>(null);
  const [thread, setThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // fetch kos by slug
  useEffect(() => {
    fetch(`/api/kos/${slug}`).then(r=>r.json()).then(j=>{
      if (j?.id) setKos(j);
      else if (j?.slug) setKos(j);
      else setKos(j);
    }).catch(()=>{});
  }, [slug]);

  // get or create thread when kos + session ready
  useEffect(() => {
    if (!kos?.id || !userId) return;
    // list threads for this kos+member
    fetch("/api/chat").then(r=>r.json()).then((threads:any[])=>{
      const found = Array.isArray(threads) ? threads.find((t:any)=> t.kosId===kos.id) : null;
      if (found) {
        setThread(found);
        // fetch messages for thread
        fetch(`/api/chat/${found.id}`).then(r=>r.json()).then(j=>{
          if (j?.messages) setMessages(j.messages);
        });
      } else {
        // will be created on first message
        setThread({ kosId: kos.id, memberId: userId, ownerId: kos.ownerId || kos.owner?.id });
      }
    }).catch(()=>{});
  }, [kos?.id, userId]);

  // realtime subscription
  useEffect(() => {
    if (!thread?.id) return;
    const supa = createSupabaseBrowser();
    const ch = supa.channel(`chat-${thread.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `threadId=eq.${thread.id}` }, (payload:any) => {
        const m = payload.new;
        setMessages(prev => prev.some(x=>x.id===m.id) ? prev : [...prev, m]);
      })
      .subscribe();
    // fallback polling tiap 4 detik kalau realtime belum enable
    const iv = setInterval(async ()=>{
      try {
        const r = await fetch(`/api/chat/${thread.id}`);
        const j = await r.json();
        if (j?.messages) setMessages(j.messages);
      } catch {}
    }, 4000);
    return ()=> { supa.removeChannel(ch); clearInterval(iv); };
  }, [thread?.id]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !kos?.id || !userId) { if(!userId) setErr("Login dulu sebagai MEMBER untuk chat"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ kosId: kos.id, memberId: userId, content: input }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Gagal kirim");
      // thread created or message inserted
      if (j.thread && !thread?.id) setThread(j.thread);
      if (j.message) setMessages(prev=>[...prev, j.message]);
      else if (j.thread?.id) {
        // refetch
        const r2 = await fetch(`/api/chat/${j.thread.id}`);
        const j2 = await r2.json();
        if (j2?.messages) setMessages(j2.messages);
      }
      setInput("");
    } catch (e:any) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4">
        <Link href={`/kos/${slug}`} className="text-sm text-[#8A7D6B] hover:underline">← Kembali ke Detail Kos</Link>
        <h1 className="mt-2 serif text-[22px]">Chat dengan Owner {kos?.nama ? `— ${kos.nama}` : ""}</h1>
        {!userId && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">Login sebagai MEMBER untuk mulai chat.</p>}
        {thread?.id && <p className="text-xs text-[#8A7D6B] mt-1">Thread {thread.id.slice(0,8)} • Realtime via Supabase + polling 4s fallback</p>}
      </div>

      <Card className="border-[#EDE6D6]">
        <CardHeader><CardTitle className="text-sm">Riwayat Chat</CardTitle></CardHeader>
        <CardContent className="space-y-2 h-[420px] overflow-y-auto bg-[#FDFBF7] rounded-xl border border-[#EDE6D6] p-3">
          {messages.length===0 ? <p className="text-sm text-[#8A7D6B] text-center py-8">Belum ada pesan — sapa owner dulu 👋</p> : messages.map((msg:any)=>(
            <div key={msg.id} className={`flex ${msg.senderId===userId ? "justify-end" : "justify-start"} mb-1`}>
              <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${msg.senderId===userId ? "bg-[#1C1610] text-white" : "bg-white border border-[#EDE6D6] text-[#1C1610]"}`}>
                <p>{msg.content}</p>
                <span className="text-[11px] opacity-60">{new Date(msg.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-3">{err}</p>}

      <form onSubmit={sendMessage} className="flex gap-2 mt-3">
        <Input value={input} onChange={(e)=>setInput(e.target.value)} placeholder={userId ? "Ketik pesan..." : "Login dulu untuk chat"} disabled={loading || !userId} className="bg-white" />
        <Button type="submit" disabled={loading || !userId} className="bg-[#C9A96A] hover:bg-[#B8944F] text-white px-6">{loading?"Mengirim...":"Kirim"}</Button>
      </form>
    </div>
  );
}
