export function Footer() {
  return (
    <footer className="border-t border-[#EDE6D6] bg-[#FDFBF7] py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AI-KOS" className="h-8 w-8 rounded-xl object-cover border border-[#EDE6D6]" />
            <span className="font-serif text-sm font-bold tracking-tight text-[#2C2416]">AI-KOS</span>
            <span className="ml-1 hidden sm:inline text-[10px] tracking-widest uppercase text-[#B8A99A]">Sistem Cerdas Kelola Kos Modern</span>
          </div>
          <div className="text-xs tracking-wide text-[#8A7D6B]">© 2026 AI-KOS — Crafted for premium living. <span className="hidden sm:inline">• Luxury • Minimal • Professional</span></div>
        </div>
      </div>
    </footer>
  );
}
