// Upload abstraction — Supabase Storage primary, mock fallback
import { uploadToSupabase, type BucketKey } from "@/lib/supabase/storage";

export async function uploadFile(
  file: File | Buffer,
  filename: string,
  bucket: BucketKey = "kos"
): Promise<string> {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  if (hasSupabase) {
    try {
      return await uploadToSupabase(file, filename, bucket);
    } catch (e: any) {
      console.error("[upload] supabase failed, fallback mock:", e?.message);
    }
  }
  // mock: placeholder
  return "https://picsum.photos/seed/" + encodeURIComponent(filename) + "/600/400";
}

export function isUploadConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function isSupabaseStorageConfigured() {
  return isUploadConfigured();
}
