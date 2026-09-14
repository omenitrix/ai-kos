import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Withdrawal() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href="/dashboard/owner" className="text-sm text-muted-foreground hover:underline">&larr; Dashboard Owner</Link>
      <Card className="mt-4">
        <CardHeader><CardTitle>Penarikan Pendapatan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">Saldo tersedia: <b>Rp 12.500.000</b></p>
          <Button className="w-full">Ajukan Penarikan (mock)</Button>
          <p className="text-xs text-muted-foreground">Integrasi payout gateway menyusul (adapter sama seperti pembayaran, via PAYMENT_PROVIDER).</p>
        </CardContent>
      </Card>
    </div>
  );
}
