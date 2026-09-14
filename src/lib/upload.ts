// Upload abstraction — env UPLOADTHING_TOKEN or S3_* ; mock returns placeholder URL
export async function uploadFile(file: File | Buffer, filename: string): Promise<string> {
  // mock: return placeholder
  return "https://picsum.photos/seed/" + encodeURIComponent(filename) + "/600/400";
}
export function isUploadConfigured() {
  return Boolean(process.env.UPLOADTHING_TOKEN || process.env.S3_BUCKET);
}
