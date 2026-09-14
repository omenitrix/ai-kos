// Payment adapter — swap provider via PAYMENT_PROVIDER env
export type PaymentRequest = { amount: number; orderId: string; customerEmail: string; method: string };
export type PaymentResponse = { redirectUrl?: string; vaNumber?: string; qrString?: string; status: string; provider: string };

export interface PaymentGateway {
  createPayment(req: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(orderId: string): Promise<{ status: string }>;
}

class MockGateway implements PaymentGateway {
  async createPayment(req: PaymentRequest): Promise<PaymentResponse> {
    return { status: "PENDING", provider: "mock", redirectUrl: "#mock-payment-" + req.orderId };
  }
  async verifyPayment(orderId: string) { return { status: "SUCCESS" }; }
}

export function getGateway(): PaymentGateway {
  // future: if env PAYMENT_PROVIDER === "midtrans" return MidtransGateway, etc.
  return new MockGateway();
}
