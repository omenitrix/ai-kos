import OpenAI from "openai";

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY && process.env.AI_PROVIDER === "openai") {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function chatAI(prompt: string): Promise<string> {
  if (!openai) {
    return "[MOCK AI] Jawaban untuk: " + prompt.slice(0, 80) + " — (isi OPENAI_API_KEY dan set AI_PROVIDER=openai untuk LLM nyata)";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });
    return completion.choices[0]?.message.content || "[AI] Tidak ada respons";
  } catch (error) {
    console.error("OpenAI error:", error);
    return "[AI ERROR] Gagal menghubungi OpenAI: " + (error as Error).message;
  }
}

export function recommendKos(filters: any, listings: any[]) {
  const budget = filters?.budget ?? 1500000;
  return [...listings].sort((a, b) => {
    const pa = a.kamar?.[0]?.hargaBulanan ?? a.hargaBulanan ?? budget;
    const pb = b.kamar?.[0]?.hargaBulanan ?? b.hargaBulanan ?? budget;
    return Math.abs(pa - budget) - Math.abs(pb - budget);
  }).slice(0, 6);
}

export function hargaPasar(area: string, listings: any[]) {
  const prices = listings.flatMap((l: any) => (l.kamar || []).map((k: any) => k.hargaBulanan).filter(Boolean));
  if (!prices.length) return { avg: 0, min: 0, max: 0, area, count: 0, note: "belum ada kamar aktif" };
  return { 
    avg: Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length), 
    min: Math.min(...prices), 
    max: Math.max(...prices), 
    area, 
    count: prices.length 
  };
}