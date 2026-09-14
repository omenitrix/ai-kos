import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MobilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader><CardTitle>Aplikasi Mobile AI-KOS</CardTitle></CardHeader>
        <CardContent className="text-center py-12">
          <h2 className="mb-4 text-xl font-bold">Segera Hadir</h2>
          <p className="mb-6 text-muted-foreground">
            Aplikasi native untuk iOS dan Android sedang dalam pengembangan.
            Sementara itu, gunakan versi web yang sudah dioptimasi untuk mobile browser.
          </p>
          <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
