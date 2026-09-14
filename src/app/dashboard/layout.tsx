"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.replace("/login"); return; }
    const role = (session.user as any).role;
    if (pathname === "/dashboard") {
      if (role === "ADMIN") router.replace("/dashboard/admin");
      else if (role === "OWNER") router.replace("/dashboard/owner");
      else router.replace("/dashboard/member");
    }
  }, [session, status, pathname, router]);

  if (status === "loading") return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-[#8A7D6B]">Memuat sesi...</div>;
  if (!session) return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-[#8A7D6B]">Mengalihkan ke login...</div>;

  return (
    <div className="flex min-h-[calc(100vh-68px)] bg-[#FDFBF7]">
      <Sidebar />
      <div className="flex-1 min-w-0 bg-[#FDFBF7]">{children}</div>
    </div>
  );
}
