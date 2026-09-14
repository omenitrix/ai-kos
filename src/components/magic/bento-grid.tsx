"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BentoKosGrid({ items }: { items: { slug: string; nama: string; alamat: string; harga: number; foto: string; badge: string }[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-5 auto-rows-[280px]">
      {items.map((k, i) => (
        <motion.div
          key={k.slug}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          className={cn("group relative overflow-hidden rounded-[20px] border border-[#EDE6D6] bg-white shadow-soft hover:shadow-soft-lg transition-shadow", i === 0 && "md:col-span-2")}
        >
          <Link href={`/kos/${k.slug}`} className="block h-full">
            <div className="relative h-[62%] w-full overflow-hidden">
              <Image src={k.foto} alt={k.nama} fill className="object-cover group-hover:scale-[1.04] transition-transform duration-700" sizes="(max-width:768px) 100vw, 33vw" />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-[#2C2416] border border-[#EDE6D6]">{k.badge}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-4 flex h-[38%] flex-col justify-between">
              <div>
                <h3 className="font-serif text-[15px] font-semibold text-[#1C1610] line-clamp-1">{k.nama}</h3>
                <p className="text-xs text-[#8A7D6B] line-clamp-1">{k.alamat}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-serif text-[16px] font-bold text-[#1C1610]">Rp {k.harga.toLocaleString("id-ID")}<span className="font-sans text-xs font-normal text-[#8A7D6B]"> /bln</span></span>
                <span className="rounded-full bg-[#1C1610] px-3.5 py-1 text-xs font-medium text-white group-hover:bg-[#C9A96A] transition-colors">Lihat →</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
