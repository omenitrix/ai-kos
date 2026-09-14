import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const count = Math.min(20, Math.max(1, Number(body.count || 12)));
  const statusMix = body.mix === "random" ? ["PENDING","SUCCESS","FAILED","REFUNDED"] as const : null;
  const supabase = createSupabaseService();

  const { data: kosList } = await supabase.from("kos_listings").select("id");
  if (!kosList || kosList.length === 0) return NextResponse.json({ error: "Belum ada kos/kamar untuk mock" }, { status: 400 });
  // need kamar per kos
  const kosIds = kosList.map((k: any) => k.id);
  const { data: kamars } = await supabase.from("kamars").select("*").in("kosId", kosIds);
  if (!kamars || kamars.length === 0) return NextResponse.json({ error: "Belum ada kos/kamar untuk mock" }, { status: 400 });
  const kamarByKos = new Map<string, any[]>();
  for (const km of kamars as any[]) {
    const arr = kamarByKos.get(km.kosId) || [];
    arr.push(km);
    kamarByKos.set(km.kosId, arr);
  }
  const { data: members } = await supabase.from("users").select("id").in("role", ["MEMBER","GUEST"]);
  let payerPool: any[] = members || [];
  if (payerPool.length === 0) {
    const { data: anyUsers } = await supabase.from("users").select("id").limit(5);
    payerPool = anyUsers || [];
  }
  if (payerPool.length === 0) return NextResponse.json({ error: "Belum ada user untuk mock" }, { status: 400 });

  const methods = ["VIRTUAL_ACCOUNT","TRANSFER_BANK","E_WALLET","QRIS"] as const;
  const statuses = ["PENDING","SUCCESS","FAILED"] as const;

  const created: any[] = [];
  for (let i = 0; i < count; i++) {
    const kos = kosList[Math.floor(Math.random() * kosList.length)] as any;
    const kosKamars = kamarByKos.get(kos.id) || kamars as any[];
    const kamar = kosKamars[Math.floor(Math.random() * kosKamars.length)];
    if (!kamar) continue;
    const payer = payerPool[Math.floor(Math.random() * payerPool.length)] as any;
    const status = statusMix ? statusMix[Math.floor(Math.random() * statusMix.length)] : statuses[Math.floor(Math.random() * statuses.length)];
    const amount = (kamar as any).hargaBulanan + Math.floor(Math.random() * 200000);
    const durasi = 1 + Math.floor(Math.random() * 3);
    const tglMulai = new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString();
    const bookingStatus = status === "SUCCESS" ? "ACTIVE" : status === "FAILED" ? "DIBATALKAN" : "PENDING_PAYMENT";
    const { data: booking, error: bErr } = await supabase.from("bookings").insert({ kosId: kos.id, kamarId: (kamar as any).id, penyewaId: payer.id, tglMulai, durasiBulan: durasi, status: bookingStatus, totalHarga: amount * durasi }).select().single();
    if (bErr || !booking) continue;
    const invoiceNo = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const { data: payment } = await supabase.from("payments").insert({ bookingId: (booking as any).id, payerId: payer.id, amount, method: methods[Math.floor(Math.random() * methods.length)], status: status as any, invoiceNo, buktiBayar: status === "SUCCESS" ? `https://picsum.photos/seed/bukti-${invoiceNo}/400/200` : null, verifiedAt: status === "SUCCESS" ? new Date().toISOString() : null }).select().single();
    if (payment) created.push(payment);
    await new Promise(r => setTimeout(r, 10));
  }

  const { count: mCount } = await supabase.from("marketplace_orders").select("id", { count: "exact", head: true });
  if ((mCount || 0) === 0) {
    const { data: svcs } = await supabase.from("marketplace_services").select("id,harga").limit(3);
    if (svcs && svcs.length && payerPool.length) {
      for (const s of svcs as any[]) {
        const payer = payerPool[Math.floor(Math.random() * payerPool.length)] as any;
        await supabase.from("marketplace_orders").insert({ serviceId: s.id, buyerId: payer.id, qty: 1 + Math.floor(Math.random() * 2), totalHarga: s.harga, status: "PENDING" });
      }
    }
  }

  return NextResponse.json({ created: created.length, sample: created.slice(0, 3) });
}
