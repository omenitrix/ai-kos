// Payment adapter — swap via PAYMENT_PROVIDER env
export type PaymentRequest = { amount: number; orderId: string; customerEmail: string; method: string };
export type PaymentResponse = { redirectUrl?: string; token?: string; vaNumber?: string; qrString?: string; status: string; provider: string };

export interface PaymentGateway {
  createPayment(req: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(orderId: string): Promise<{ status: string }>;
}

class MockGateway implements PaymentGateway {
  async createPayment(req: PaymentRequest): Promise<PaymentResponse> {
    return { status: "PENDING", provider: "mock", redirectUrl: "#mock-payment-" + req.orderId };
  }
  async verifyPayment(_orderId: string) { return { status: "SUCCESS" }; }
}

class MidtransGateway implements PaymentGateway {
  async createPayment(req: PaymentRequest): Promise<PaymentResponse> {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || (process.env as any).MIDTRANS_SERVER_KEY;
    const isProd = (process.env.MIDTRANS_IS_PRODUCTION || "").toLowerCase() === "true";
    if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum di-set — set di Vercel + .env lalu redeploy");
    const base = isProd ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
    const auth = Buffer.from(serverKey + ":").toString("base64");
    const res = await fetch(`${base}/snap/v1/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}`, Accept: "application/json" },
      body: JSON.stringify({
        transaction_details: { order_id: req.orderId, gross_amount: req.amount },
        customer_details: { email: req.customerEmail || "customer@ai-kos.local" },
        enabled_payments: ["bca_va","bni_va","bri_va","permata_va","gopay","qris","credit_card"],
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Midtrans error ${res.status}: ${j.error_messages?.join?.(", ") || JSON.stringify(j)}`);
    // j: { token, redirect_url }
    return { status: "PENDING", provider: "midtrans", token: j.token, redirectUrl: j.redirect_url };
  }
  async verifyPayment(orderId: string) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || (process.env as any).MIDTRANS_SERVER_KEY;
    if (!serverKey) return { status: "UNKNOWN" };
    const isProd = (process.env.MIDTRANS_IS_PRODUCTION || "").toLowerCase() === "true";
    const base = isProd ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
    const auth = Buffer.from(serverKey + ":").toString("base64");
    const res = await fetch(`${base}/v2/${encodeURIComponent(orderId)}/status`, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
    });
    const j = await res.json().catch(() => ({}));
    const s = j.transaction_status as string;
    if (s === "settlement" || s === "capture") return { status: "SUCCESS" };
    if (s === "pending") return { status: "PENDING" };
    if (s === "deny" || s === "expire" || s === "cancel" || s === "failure") return { status: "FAILED" };
    return { status: j.status_code ? "PENDING" : "UNKNOWN" };
  }
}

export function getGateway(): PaymentGateway {
  const provider = (process.env.PAYMENT_PROVIDER || process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || "mock").toLowerCase();
  if (provider === "midtrans") return new MidtransGateway();
  return new MockGateway();
}
