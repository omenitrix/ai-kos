import { NextResponse } from "next/server";
import { chatAI } from "@/lib/ai";

export async function POST(req: Request) {
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });
  const reply = await chatAI(message);
  return NextResponse.json({ reply });
}
