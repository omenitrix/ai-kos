import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const filename = file.name || "upload";
  const url = await uploadFile(file, filename);
  return NextResponse.json({ url });
}
