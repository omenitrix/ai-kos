import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function OwnerPromosiIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard/owner" className="text-sm text-muted-foreground hover:underline">&larr; Dashboard Owner</Link>
      <h1 className="mt-2 text-xl font-bold">Promosi & Iklan</h1>
      <p className="text-sm text-muted-foreground">Kelola banner, flash sale, featured listing. Buat promo per-kos di halaman detail kos → Promo.</p>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Banner Promo</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Upload banner via /api/uploadthing (mock).</CardContent></Card>
        <Card><CardHeader><CardTitle>Featured Listing</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Admin perlu approve flagged isFeatured.</CardContent></Card>
      </div>
    </div>
  );
}
