import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const clientKey = (process.env.MIDTRANS_CLIENT_KEY || "").trim();
    const snapJs = (process.env.MIDTRANS_SNAP_JS || "https://app.sandbox.midtrans.com/snap/snap.js").trim();
    const isProd = (process.env.MIDTRANS_IS_PRODUCTION || "false").toLowerCase() === "true";
    if (!clientKey) {
      return NextResponse.json({ clientKey: "", snapJs, isProduction: isProd, enabled: false, error: "MIDTRANS_CLIENT_KEY belum set di Vercel Env — set Production + Redeploy UNCHECK cache" }, { status: 200 });
    }
    return NextResponse.json({ clientKey, snapJs, isProduction: isProd, enabled: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ clientKey: "", snapJs: "https://app.sandbox.midtrans.com/snap/snap.js", isProduction: false, enabled: false, error: e?.message || "midtrans-config error" }, { status: 200 });
  }
}
