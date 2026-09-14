"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";

function IHome(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M3 10L12 3l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z"/></svg>}
function ISearch(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20L15 15"/></svg>}
function IBuilding(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>}
function IPlus(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 5v14M5 12h14"/></svg>}
function ITag(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M20 12l-8 8-8-8V4h8z"/><circle cx="9" cy="9" r="1.6" fill="currentColor" stroke="none"/></svg>}
function IUser(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="12" cy="8" r="3.5"/><path d="M5 19a7 7 0 0 1 14 0"/></svg>}
function IUsers(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
function IBadge(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.3L12 15.5 7.1 18l.9-5.3-4-3.9 5.5-.8z"/></svg>}
function IChart(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M3 3v18h18"/><path d="M7 16l4-4 3 3 5-6"/></svg>}
function IWallet(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h4"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/></svg>}
function IMessage(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H8l-4 4v-12A8.5 8.5 0 0 1 12.5 3.5z"/></svg>}
function IShop(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M6 7h12l-1 9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>}
function ISparkle(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9z"/><path d="M19 14l1 1 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1z"/></svg>}
function ILog(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M14 8l4 4-4 4"/><path d="M18 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>}
function IMenu(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>}
function IClose(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>}
function IChevron(p:any){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M6 9l6 6 6-6"/></svg>}

type Item = { href: string; label: string; icon: any; badge?: string };

function NavItem({ item, active, onClick }: { item: Item; active: boolean; onClick?: ()=>void }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all border ${active ? "bg-white border-[#E8DCC8] text-[#1C1610] shadow-soft font-medium" : "border-transparent text-[#6B5E4F] hover:bg-white hover:border-[#EDE6D6] hover:text-[#2C2416]"}`}>
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${active ? "bg-[#FDFBF7] border-[#E8DCC8] text-[#C9A96A]" : "bg-white border-[#EDE6D6] text-[#9A8E7A]"}`}>
        <Icon className="h-[15px] w-[15px]" />
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && <span className="rounded-full bg-[#C9A96A] px-2 py-0.5 text-[10px] font-bold text-white">{item.badge}</span>}
      {active && <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96A]" />}
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="px-3 text-[10px] font-semibold tracking-[0.16em] uppercase text-[#B8A99A]">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MarketplaceDropdown({ items, pathname, onClose }: { items: Item[]; pathname: string; onClose: ()=>void }) {
  const isActive = pathname.includes("marketplace");
  const [open, setOpen] = useState(isActive);
  useEffect(()=>{ if(isActive) setOpen(true); }, [isActive]);
  return (
    <div className={`rounded-xl border transition-all ${isActive ? "bg-white border-[#E8DCC8] shadow-soft" : "border-transparent bg-transparent"} ${open ? "pb-1" : ""}`}>
      <button onClick={()=>setOpen(v=>!v)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all border ${isActive ? "bg-white border-transparent text-[#1C1610] font-medium" : "border-transparent text-[#6B5E4F] hover:bg-white hover:border-[#EDE6D6] hover:text-[#2C2416]"}`}>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isActive ? "bg-[#FDFBF7] border-[#E8DCC8] text-[#C9A96A]" : "bg-white border-[#EDE6D6] text-[#9A8E7A]"}`}>
          <IShop className="h-[15px] w-[15px]" />
        </span>
        <span className="flex-1 text-left truncate">Marketplace</span>
        <span className={`rounded-full px-1.5 py-0.5 transition-transform ${open ? "rotate-180" : ""}`}><IChevron className="h-3.5 w-3.5 text-[#B8A99A]" /></span>
      </button>
      <div className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="mx-3 mb-2 mt-1 space-y-1 border-t border-[#F3EFE6] pt-2">
            {items.map(c=>{
              const active = pathname===c.href || pathname.startsWith(c.href+"/");
              const Icon = c.icon;
              return (
                <Link key={c.href} href={c.href} onClick={onClose}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] border ${active ? "bg-[#FDFBF7] border-[#E8DCC8] text-[#1C1610] font-medium" : "border-transparent text-[#6B5E4F] hover:bg-[#FDFBF7] hover:text-[#2C2416]"}`}>
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-[#C9A96A]" : "text-[#9A8E7A]"}`} />
                  <span className="flex-1 truncate">{c.label}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96A]" />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user as any)?.role as string | undefined;
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const memberItems: Item[] = [
    { href: "/dashboard/member", label: "Dashboard", icon: IHome },
    { href: "/kos/cari", label: "Cari Kos", icon: ISearch },
    { href: "/dashboard/member/insights", label: "Insight Saya", icon: ISparkle },
    { href: "/dashboard/member/penyewaan", label: "Penyewaan", icon: IBuilding },
    { href: "/dashboard/member/pembayaran", label: "Pembayaran", icon: IWallet },
  ];
  const memberMarketplace: Item[] = [
    { href: "/marketplace", label: "Jelajahi Toko", icon: ISearch },
    { href: "/dashboard/member/marketplace/orders", label: "Pesanan Saya", icon: IWallet },
  ];
  const ownerItems: Item[] = [
    { href: "/dashboard/owner", label: "Dashboard", icon: IHome },
    { href: "/dashboard/owner/analytics", label: "Analytics", icon: IChart },
    { href: "/dashboard/owner/kos", label: "Kos Saya", icon: IBuilding },
    { href: "/dashboard/owner/kos/add", label: "Tambah Kos", icon: IPlus },
    { href: "/dashboard/owner/promosi", label: "Promosi", icon: ITag },
    { href: "/dashboard/owner/withdrawal", label: "Penarikan", icon: IWallet },
  ];
  const ownerMarketplace: Item[] = [
    { href: "/marketplace", label: "Jelajahi Toko", icon: ISearch },
    { href: "/dashboard/owner/marketplace/orders", label: "Pesanan Masuk", icon: IWallet },
  ];
  const adminItems: Item[] = [
    { href: "/dashboard/admin", label: "Dashboard", icon: IHome },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: IChart },
    { href: "/dashboard/admin/users", label: "Kelola User", icon: IUsers },
    { href: "/dashboard/admin/owners", label: "Kelola Owner", icon: IBadge },
    { href: "/dashboard/admin/listings", label: "Approval Listing", icon: IBuilding },
    { href: "/dashboard/admin/transaksi", label: "Transaksi", icon: IWallet },
    { href: "/dashboard/admin/logs", label: "Logs", icon: ILog },
  ];
  const adminMarketplace: Item[] = [
    { href: "/dashboard/admin/marketplace", label: "Kelola Layanan", icon: ITag },
    { href: "/dashboard/admin/marketplace/orders", label: "Pesanan Marketplace", icon: IWallet },
    { href: "/marketplace", label: "Lihat Store", icon: ISearch },
  ];

  const items = role === "ADMIN" ? adminItems : role === "OWNER" ? ownerItems : memberItems;
  const marketplaceItems = role === "ADMIN" ? adminMarketplace : role === "OWNER" ? ownerMarketplace : memberMarketplace;
  const roleLabel = role === "ADMIN" ? "Admin" : role === "OWNER" ? "Owner" : role === "MEMBER" ? "Member" : "Guest";

  // profil href per role
  const profilHref = role === "ADMIN" ? "/dashboard/admin/profil" : role === "OWNER" ? "/dashboard/owner/profil" : "/dashboard/member/profil";

  const close = () => setOpen(false);

  return (
    <>
      <button onClick={()=>setOpen(v=>!v)} className="lg:hidden fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#1C1610] text-white shadow-soft-lg border border-[#3A2E1E]">
        {open ? <IClose className="h-5 w-5"/> : <IMenu className="h-5 w-5"/>}
      </button>
      {open && <div onClick={close} className="fixed inset-0 z-30 bg-[#1C1610]/30 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed lg:sticky top-[68px] lg:top-[68px] z-30 h-[calc(100vh-68px)] w-[280px] shrink-0 border-r border-[#EDE6D6] bg-[#FDFBF7] flex flex-col overflow-hidden transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} lg:flex`}>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="rounded-2xl border border-[#EDE6D6] bg-white p-3.5 shadow-soft flex items-center gap-3">
            <Image src="/logo.png" alt="AI-KOS" width={40} height={40} className="h-10 w-10 rounded-xl object-cover border border-[#EDE6D6]" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#1C1610] truncate">{session?.user?.name || session?.user?.email || "Tamu"}</div>
              <div className="text-[11px] tracking-wide text-[#8A7D6B] truncate">{session?.user?.email || "Belum login"} • <span className="font-medium text-[#C9A96A]">{roleLabel}</span></div>
            </div>
          </div>
          <Section title="Menu">
            {items.map(it => <NavItem key={it.href} item={it} active={isActive(it.href)} onClick={close} />)}
            <MarketplaceDropdown pathname={pathname} onClose={close} items={marketplaceItems} />
            <NavItem item={{ href: "/ai", label: "AI Concierge", icon: ISparkle, badge: "AI" }} active={isActive("/ai")} onClick={close} />
          </Section>
          <Section title="Akun">
            <NavItem item={{ href: profilHref, label: "Profil Saya", icon: IUser }} active={isActive(profilHref) || pathname.includes("/profil")} onClick={close} />
          </Section>
          <Section title="Bantuan">
            <NavItem item={{ href: "/kos/cari", label: "Pusat Bantuan", icon: IMessage }} active={false} onClick={close} />
            <NavItem item={{ href: "/mobile", label: "Aplikasi Mobile — Soon", icon: IShop }} active={isActive("/mobile")} onClick={close} />
          </Section>
          <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] p-4 text-white border border-[#3A2E1E]">
            <div className="flex items-center gap-2 text-sm font-medium"><ISparkle className="h-4 w-4 text-[#C9A96A]"/> AI Concierge</div>
            <p className="mt-1 text-xs leading-relaxed text-[#E8DCC8]">Tanya rekomendasi kos, prediksi harga, atau bantu booking 24/7.</p>
            <Link href="/ai" onClick={close} className="mt-3 inline-flex rounded-full bg-[#C9A96A] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#B8944F]">Buka AI</Link>
          </div>
        </div>
        <div className="border-t border-[#EDE6D6] bg-white/60 p-3">
          {session ? (
            <button onClick={()=>signOut({ callbackUrl: "/" })} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8DCC8] bg-white px-3 py-2.5 text-sm font-medium text-[#2C2416] hover:bg-[#FDFBF7]">
              <ILog className="h-4 w-4 text-[#8A7D6B]"/> Keluar
            </button>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" onClick={close} className="flex-1 rounded-xl bg-[#1C1610] px-3 py-2.5 text-center text-sm font-medium text-white">Masuk</Link>
              <Link href="/register" onClick={close} className="flex-1 rounded-xl border border-[#E8DCC8] bg-white px-3 py-2.5 text-center text-sm font-medium">Daftar</Link>
            </div>
          )}
          <p className="mt-2 text-center text-[10px] tracking-widest uppercase text-[#B8A99A]">AI-KOS • Luxury Living</p>
        </div>
      </aside>
    </>
  );
}
