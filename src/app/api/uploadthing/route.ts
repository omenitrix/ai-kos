import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";
import type { BucketKey } from "@/lib/supabase/storage";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const filename = file.name || "upload.jpg";
  const bucket = (form.get("bucket") as BucketKey) || "kos";
  // 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File maksimal 5MB" }, { status: 400 });
  }
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return NextResponse.json({ error: "Hanya image/video" }, { status: 400 });
  }
  try {
    const url = await uploadFile(file, filename, bucket);
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload gagal" }, { status: 500 });
  }
}
