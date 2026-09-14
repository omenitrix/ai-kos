"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KosChat() {
  const params = useParams() as { slug: string };
  const slug = params.slug;
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // In real app, we would fetch thread ID from API using kos slug and user ID
  // For now, mock
  const threadId = "mock-thread-1";

  useEffect(() => {
    // mock: fetch messages
    const mockMessages: any[] = [
      { id: "m1", senderId: "owner", content: "Hai! Ada yang bisa saya bantu rigupskos ini?", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 10) },
      { id: "m2", senderId: "member", content: "Hai, saya tertarik dengan kamar A-01. Apakah masih tersedia?", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 5) },
    ];
    setMessages(mockMessages);
  }, [threadId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    // mock: send to API and get response
    const newMsg = { id: `msg-${Date.now()}`, senderId: "member", content: input, isRead: false, createdAt: new Date() };
    setMessages([...messages, newMsg]);
    setInput("");
    setLoading(false);
    // In real app, we would POST to /api/chat with { kosId, memberId, content }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4">
        <Link href={`/kos/${slug}`} className="text-sm text-muted-foreground hover:underline">&larr; Kembali ke Detail Kos</Link>
        <h1 className="mt-2 text-xl font-bold">Chat dengan Owner</h1>
      </div>

      <div className="mb-4">
        <Card className="border">
          <CardHeader><CardTitle>Riwayat Chat</CardTitle></CardHeader>
          <CardContent className="space-y-4 h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === "member" ? "justify-end" : "justify-start"} mb-2`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.senderId === "member" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs">{msg.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <Input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Ketik pesan..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="px-4">
          {loading ? "Mengirim..." : "Kirim"}
        </Button>
      </form>
    </div>
  );
}
