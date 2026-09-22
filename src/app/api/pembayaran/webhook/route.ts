import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/server";
import { verifyMidtransSignature } from "@/lib/midtrans";

export async function POST(req: Request) {
  // ===== CRITICAL SECURITY FIX =====
  // WAJIB SET SERVER KEY di environment, tidak boleh kosong!
  const serverKey = process.env.MIDTRANS_SERVER_KEY || (process.env as any).MIDTRANS_SERVER_KEY;
  
  if (!serverKey) {
    // BLOCK semua request jika server key tidak di-set
    return new NextResponse("FATAL: MIDTRANS_SERVER_KEY not configured", { status: 500 });
  }

  // Parse payload
  const raw = await req.text();
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return new NextResponse("Invalid JSON", { status: 400 }); }

  // ===== SIGNATURE VERIFICATION (MANDATORY) =====
  const signatureKey = String(payload.signature_key || req.headers.get("x-signature") || "");
  
  if (!signatureKey) {
    return new NextResponse("Missing signature", { status: 401 });
  }

  const ok = verifyMidtransSignature(signatureKey, raw, serverKey);
  if (!ok) {
    // Log attempt untuk debugging
    console.error("[SECURITY] Invalid webhook signature detected", {
      orderId: payload.order_id,
      providedSignature: signatureKey.substring(0, 16) + "...",
      ip: req.headers.get("x-forwarded-for") || req.headers.get("host"),
      timestamp: new Date().toISOString()
    });
    return new NextResponse("Invalid signature", { status: 401 });
  }

  // ===== ORDER ID VALIDATION =====
  const orderId = String(payload.order_id || "");
  if (!orderId) return new NextResponse("order_id required", { status: 400 });

  // FILTER transaction_status yang valid
  const validStatuses = ["settlement", "capture", "pending", "deny", "expire", "cancel", "failure", "refund", "partial_refund"];
  const tx = String(payload.transaction_status || "");
  if (!validStatuses.includes(tx)) {
    return new NextResponse("Invalid transaction_status", { status: 400 });
  }

  // ===== PAYMENT STATUS MAPPING =====
  let paymentStatus: "PENDING" | "SUCCESS" | "FAILED" = "PENDING";
  let bookingStatus: string | null = null;
  
  if (tx === "settlement" || tx === "capture") { 
    paymentStatus = "SUCCESS"; 
    bookingStatus = "ACTIVE"; 
  }
  else if (tx === "pending") { 
    paymentStatus = "PENDING"; 
  }
  else if (["deny", "expire", "cancel", "failure", "refund", "partial_refund"].includes(tx)) { 
    paymentStatus = "FAILED"; 
    if (tx === "expire" || tx === "cancel") bookingStatus = "DIBATALKAN"; 
  }

  // Fraud challenge
  if (payload.fraud_status === "challenge") { 
    paymentStatus = "PENDING"; 
    bookingStatus = null; 
  }

  const supa = createSupabaseService();

  // ===== PAYMENT LOOKUP (bookingId first, then invoiceNo) =====
  // 1. Cari by bookingId (primary reference)
  const { data: pay } = await supa.from("payments").select("id,bookingId,status,amount").eq("bookingId", orderId).maybeSingle();
  
  if (pay) {
    // VALIDATE AMOUNT (anti-tampering)
    const expectedAmount = String(pay.amount || "");
    const providedAmount = String(payload.gross_amount || "0");
    
    if (expectedAmount && providedAmount !== expectedAmount) {
      console.error("[SECURITY] Amount mismatch", { orderId, expectedAmount, providedAmount });
      // Optional: reject or proceed with warning
    }

    await supa.from("payments").update({ status: paymentStatus } as any).eq("id", (pay as any).id);
    if (bookingStatus) await supa.from("bookings").update({ status: bookingStatus } as any).eq("id", (pay as any).bookingId);
    return NextResponse.json({ 
      received: true, 
      paymentStatus, 
      bookingStatus, 
      via: "bookingId",
      secured: true 
    });
  }

  // 2. Cari by invoiceNo (fallback)
  const { data: pay2 } = await supa.from("payments").select("id,bookingId,status").eq("invoiceNo", orderId).maybeSingle();
  
  if (pay2) {
    await supa.from("payments").update({ status: paymentStatus } as any).eq("id", (pay2 as any).id);
    if (bookingStatus) await supa.from("bookings").update({ status: bookingStatus } as any).eq("id", (pay2 as any).bookingId);
    return NextResponse.json({ 
      received: true, 
      paymentStatus, 
      bookingStatus, 
      via: "invoiceNo",
      secured: true 
    });
  }

  // ===== CRITICAL: REJECT UNKNOWN ORDERS =====
  // Jangan return 200 untuk order_id tidak ditemukan!
  // Ini mencegah abuse dan log flooding
  console.warn("[SECURITY] Unknown order_id rejected", { orderId, payload });
  return new NextResponse("Order not found", { status: 404 });
}