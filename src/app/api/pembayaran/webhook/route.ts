import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/server";
import { verifyMidtransSignature } from "@/lib/midtrans";

export async function POST(req: Request) {
  const raw = await req.text();
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return new NextResponse("Invalid JSON", { status: 400 }); }

  const signatureKey = String(payload.signature_key || req.headers.get("signature") || "");
  const serverKey = process.env.MIDTRANS_SERVER_KEY || (process.env as any).MIDTRANS_SERVER_KEY || "";

  // jika MIDTRANS_SERVER_KEY belum di-set, tolak hanya saat header signature ada — tapi kalau serverKey kosong, skip verify (dev)
  if (serverKey) {
    const ok = verifyMidtransSignature(signatureKey, raw, serverKey);
    if (!ok) return new NextResponse("Invalid signature", { status: 401 });
  }

  const orderId = String(payload.order_id || "");
  if (!orderId) return new NextResponse("order_id required", { status: 400 });

  const tx = String(payload.transaction_status || "");
  // map midtrans → PaymentStatus (PENDING|SUCCESS|FAILED) + booking follow-up
  let paymentStatus: "PENDING" | "SUCCESS" | "FAILED" = "PENDING";
  let bookingStatus: string | null = null;
  if (tx === "settlement" || tx === "capture") { paymentStatus = "SUCCESS"; bookingStatus = "ACTIVE"; }
  else if (tx === "pending") { paymentStatus = "PENDING"; }
  else if (["deny", "expire", "cancel", "failure", "refund", "partial_refund"].includes(tx)) { paymentStatus = "FAILED"; if (tx === "expire" || tx === "cancel") bookingStatus = "DIBATALKAN"; }

  // fraud challenge
  if (payload.fraud_status === "challenge") { paymentStatus = "PENDING"; bookingStatus = null; }

  const supa = createSupabaseService();

  // payments.invoiceNo kadang dipakai sebagai orderId fallback — coba cari by bookingId dulu
  // order_id kita = booking.id
  const { data: pay } = await supa.from("payments").select("id,bookingId,status").eq("bookingId", orderId).maybeSingle();
  if (pay) {
    await supa.from("payments").update({ status: paymentStatus } as any).eq("id", (pay as any).id);
    if (bookingStatus) await supa.from("bookings").update({ status: bookingStatus } as any).eq("id", (pay as any).bookingId);
    return NextResponse.json({ received: true, paymentStatus, bookingStatus, via: "bookingId" });
  }
  // fallback: cari by invoiceNo
  const { data: pay2 } = await supa.from("payments").select("id,bookingId").eq("invoiceNo", orderId).maybeSingle();
  if (pay2) {
    await supa.from("payments").update({ status: paymentStatus } as any).eq("id", (pay2 as any).id);
    if (bookingStatus) await supa.from("bookings").update({ status: bookingStatus } as any).eq("id", (pay2 as any).bookingId);
    return NextResponse.json({ received: true, paymentStatus, bookingStatus, via: "invoiceNo" });
  }

  // tidak ketemu tapi tetap 200 biar Midtrans tidak retry spam
  return NextResponse.json({ received: true, paymentStatus, note: "payment not found — order_id tidak match bookingId/invoiceNo" });
}
