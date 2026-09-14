"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role;
  const dashboardHref =
    role === "ADMIN" ? "/dashboard/admin" : role === "OWNER" ? "/dashboard/owner" : "/dashboard/member";
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#EDE6D6] bg-[#FDFBF7]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="AI-KOS" width={36} height={36} className="h-9 w-9 rounded-xl object-cover border border-[#EDE6D6] shadow-soft" />
          <span className="font-serif text-[18px] font-bold tracking-tight text-[#2C2416]">AI-KOS</span>
          <span className="hidden sm:inline ml-1 rounded-full border border-[#E8DCC8] bg-white px-2.5 py-0.5 text-[10px] tracking-widest uppercase text-[#8A7D6B]">Luxury Living</span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/kos/cari" className="hidden md:inline px-3 py-1.5 text-[#5C5448] hover:text-[#2C2416]">Cari Kos</Link>
          <Link href="/marketplace" className="hidden md:inline px-3 py-1.5 text-[#5C5448] hover:text-[#2C2416]">Marketplace</Link>
          <Link href="/ai" className="hidden md:inline px-3 py-1.5 text-[#5C5448] hover:text-[#2C2416]">AI Concierge</Link>
          {status === "loading" ? (
            <span className="px-3 py-1.5 text-xs text-[#B8A99A]">Memuat...</span>
          ) : session ? (
            <>
              <Link href={dashboardHref} className="hidden sm:inline px-3 py-1.5 font-medium text-[#2C2416] hover:underline underline-offset-4">Dashboard</Link>
              <span className="hidden lg:inline text-xs text-[#8A7D6B] max-w-[160px] truncate">{session.user?.email} • {role}</span>
              <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>Keluar</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">Masuk</Button></Link>
              <Link href="/register"><Button size="sm">Daftar</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
