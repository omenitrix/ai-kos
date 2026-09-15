import crypto from "crypto";

export function verifyMidtransSignature(
  signature: string,
  payload: string,
  serverKey: string
): boolean {
  if (!signature || !payload || !serverKey) return false;
  try {
    const json = JSON.parse(payload);
    const orderId = json.order_id || "";
    const statusCode = json.transaction_status || "";
    const grossAmount = json.gross_amount || "";
    // The signature is SHA512 of order_id + status_code + gross_amount + serverKey
    const hash = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex");
    return hash === signature;
  } catch (e) {
    return false;
  }
}