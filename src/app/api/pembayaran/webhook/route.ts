import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/server";
import { verifyMidtransSignature } from "@/lib/midtrans";

export async function POST(req: Request) {
  // Only accept POST from Midtrans
  const supa = createSupabaseService();
  const signature = req.headers.get("signature") || "";
  const body = await req.text(); // raw body for signature verification

  // Verify signature (simplified)
  const isValid = verifyMidtransSignature(signature, body, process.env.MIDTRANS_SERVER_KEY || "");
  if (!isValid) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(body);
  const orderId = payload.order_id; // Midtrans order_id
  const transactionStatus = payload.transaction_status; // settlement, pending, deny, expire, cancel

  // Map Midtrans status to our status
  let status: string;
  switch (transactionStatus) {
    case "settlement":
      status = "PAID";
      break;
    case "pending":
      status = "PENDING";
      break;
    case "deny":
    case "expire":
    case "cancel":
      status = "FAILED";
      break;
    default:
      status = "PENDING";
  }

  // Update payment record
  const { error } = await supa
    .from("payments")
    .update({ status })
    .eq("orderId", orderId);

  if (error) {
    console.error("Midtrans webhook error:", error);
    return new NextResponse("Database error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}