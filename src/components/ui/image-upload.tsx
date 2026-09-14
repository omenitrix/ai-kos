"use client";
import Image from "next/image";
import { useRef, useState } from "react";

export function ImageUpload({
  label = "Upload foto",
  bucket = "kos",
  onUploaded,
  maxSizeMB = 5,
}: {
  label?: string;
  bucket?: "kos" | "kamar" | "verifikasi" | "bukti";
  onUploaded: (url: string) => void;
  maxSizeMB?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const doUpload = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Maks ${maxSizeMB}MB`);
      return;
    }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", bucket);
    try {
      const res = await fetch("/api/uploadthing", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload gagal");
      onUploaded(j.url);
      setPreview(j.url);
    } catch (e: any) {
      alert(e.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) doUpload(f); }}
      onClick={() => inputRef.current?.click()}
      className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${dragOver ? "border-[#C9A96A] bg-[#FFF8E7]" : "border-[#EDE6D6] bg-[#FDFBF7] hover:border-[#C9A96A]"}`}
    >
      <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) doUpload(f); }} />
      {preview ? (
        <Image src={preview} alt="preview" width={128} height={128} className="mx-auto h-32 w-auto rounded-xl object-cover" unoptimized />
      ) : (
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#8A7D6B]">{label}</p>
          <p className="text-xs text-[#A99B8A]">Drag & drop atau klik — maks {maxSizeMB}MB (image/video)</p>
        </div>
      )}
      {uploading && <p className="mt-2 text-xs text-[#C9A96A]">Mengupload...</p>}
    </div>
  );
}
