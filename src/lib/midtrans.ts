import crypto from "crypto";

export function verifyMidtransSignature(
  signature: string,
  payload: string,
  serverKey: string
): boolean {
  if (!signature || !payload || !serverKey) return false;
  try {
    const j = JSON.parse(payload);
    const orderId = String(j.order_id || "");
    const statusCode = String(j.status_code || "");
    const grossAmount = String(j.gross_amount || "");
    // spec: SHA512(order_id + status_code + gross_amount + serverKey)
    const hash = crypto.createHash("sha512").update(orderId + statusCode + grossAmount + serverKey).digest("hex");
    return hash === signature;
  } catch {
    return false;
  }
}
