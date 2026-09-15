import { NextResponse } from "next/server";

export async function GET() {
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || (process.env as any).MIDTRANS_CLIENT_KEY || "";
  const snapJs = process.env.MIDTRANS_SNAP_JS || "https://app.sandbox.midtrans.com/snap/snap.js";
  const isProd = (process.env.MIDTRANS_IS_PRODUCTION || "false").toLowerCase();
  if (!clientKey) return NextResponse.json({ error: "MIDTRANS_CLIENT_KEY belum set" }, { status: 500 });
  return NextResponse.json({ clientKey, snapJs, isProduction: isProd === "true" });
}
