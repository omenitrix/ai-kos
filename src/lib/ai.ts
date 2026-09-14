export async function chatAI(prompt: string): Promise<string> {
  if (!process.env.AI_PROVIDER_API_KEY || process.env.AI_PROVIDER === "mock") {
    return "[MOCK AI] Jawaban untuk: " + prompt.slice(0, 80) + " — (isi AI_PROVIDER_API_KEY untuk LLM nyata)";
  }
  return "[AI] " + prompt;
}
export function recommendKos(filters: any, listings: any[]) {
  const budget = filters?.budget ?? 1500000;
  return [...listings].sort((a,b) => {
    const pa = a.kamar?.[0]?.hargaBulanan ?? a.hargaBulanan ?? budget;
    const pb = b.kamar?.[0]?.hargaBulanan ?? b.hargaBulanan ?? budget;
    return Math.abs(pa-budget) - Math.abs(pb-budget);
  }).slice(0,6);
}
export function hargaPasar(area: string, listings: any[]) {
  const prices = listings.flatMap((l:any)=> (l.kamar||[]).map((k:any)=>k.hargaBulanan).filter(Boolean));
  if (!prices.length) return { avg: 0, min: 0, max: 0, area, count: 0, note: "belum ada kamar aktif" };
  return { avg: Math.round(prices.reduce((a:number,b:number)=>a+b,0)/prices.length), min: Math.min(...prices), max: Math.max(...prices), area, count: prices.length };
}
