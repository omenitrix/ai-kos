import { createSupabaseService } from "@/lib/supabase/server";

const BUCKETS = {
  kos: "kos-foto",
  kamar: "kamar-foto",
  verifikasi: "verifikasi",
  bukti: "bukti-bayar",
} as const;

export type BucketKey = keyof typeof BUCKETS;

export async function uploadToSupabase(
  file: File | Buffer,
  filename: string,
  bucket: BucketKey = "kos"
) {
  const supa = createSupabaseService();
  const bucketName = BUCKETS[bucket];
  const ext = filename.split(".").pop() || "jpg";
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer());
  const contentType = file instanceof File ? file.type || "image/jpeg" : "image/jpeg";

  const { error } = await supa.storage.from(bucketName).upload(key, buf, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supa.storage.from(bucketName).getPublicUrl(key);
  return data.publicUrl;
}

export function getBucketName(k: BucketKey) {
  return BUCKETS[k];
}
