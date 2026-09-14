import { useEffect, useRef } from "react";

type KosPin = { id: string; slug: string; nama: string; alamat: string; harga: number; lat: number; lng: number };

export default function KosMap({ pins, userLoc, onSelect, focusSlug }: { pins: KosPin[]; userLoc: { lat: number; lng: number } | null; onSelect?: (pin: KosPin) => void; focusSlug?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const pinsKey = JSON.stringify(pins);

  useEffect(() => {
    let cancelled = false;
    let retryId: any = null;
    let map: any = null;
    let markers: any[] = [];

    const start = async () => {
      if (cancelled) return;
      const el = containerRef.current;
      if (!el) {
        retryId = setTimeout(start, 120);
        return;
      }
      // kalau container masih 0px (hidden / belum layout) — tunda init biar ga crash getPosition
      if (el.clientWidth === 0 || el.clientHeight === 0) {
        retryId = setTimeout(start, 150);
        return;
      }

      // @ts-ignore
      const L = await import("leaflet");
      // @ts-ignore css side-effect — dynamic biar ga SSR crash
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;
      // cegah double init (StrictMode)
      if (containerRef.current.innerHTML.trim() !== "") {
        // sudah ada map sebelumnya — bersihkan dulu
        try { mapRef.current && mapRef.current.remove(); } catch {}
        containerRef.current.innerHTML = "";
      }

      // fix default icon
      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center: [number, number] = userLoc ? [userLoc.lat, userLoc.lng] : pins.length ? [pins[0].lat, pins[0].lng] : [-6.2088, 106.8456];

      map = L.map(el, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        // matikan animasi zoom — ini yang bikin crash getPosition/_getMapPanePos pas container belum fully layout
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
        // cegah zoom inertia aneh
        zoomSnap: 0.5,
      }).setView(center, userLoc ? 13 : 6);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      if (userLoc) {
        const you = L.circleMarker([userLoc.lat, userLoc.lng], { radius: 8, color: "#1C1610", fillColor: "#C9A96A", fillOpacity: 0.95, weight: 2 }).addTo(map);
        you.bindPopup("<b>Lokasi kamu</b>");
        L.circle([userLoc.lat, userLoc.lng], { radius: 800, color: "#C9A96A", fillOpacity: 0.06, weight: 1 }).addTo(map);
      }

      pins.forEach((p) => {
        const html = `<div style="display:flex;align-items:center;gap:6px;background:${focusSlug === p.slug ? "#1C1610" : "white"};color:${focusSlug === p.slug ? "white" : "#1C1610"};border:1px solid ${focusSlug === p.slug ? "#1C1610" : "#EDE6D6"};border-radius:999px;padding:4px 8px;box-shadow:0 6px 20px rgba(28,22,16,.12);font-size:11px;font-weight:700;white-space:nowrap"><span style="height:8px;width:8px;border-radius:999px;background:#C9A96A;display:inline-block"></span><span>Rp ${(p.harga / 1000).toFixed(0)}rb</span></div>`;
        const icon = L.divIcon({ className: "", html, iconSize: undefined as any, iconAnchor: [40, 14] as any });
        const m = L.marker([p.lat, p.lng], { icon }).addTo(map);
        const popup = `<div style="min-width:180px"><div style="font-weight:700;font-size:13px;color:#1C1610">${p.nama}</div><div style="font-size:11px;color:#8A7D6B;margin-top:2px">${p.alamat}</div><div style="margin-top:6px;font-weight:700;color:#C9A96A">Rp ${p.harga.toLocaleString("id-ID")}/bln</div><a href="/kos/${p.slug}" style="display:inline-block;margin-top:8px;background:#1C1610;color:white;border-radius:999px;padding:6px 10px;font-size:11px;text-decoration:none">Lihat Detail →</a></div>`;
        m.bindPopup(popup);
        m.on("click", () => onSelect?.(p));
        markers.push(m);
      });

      // fitBounds setelah map ready + size valid
      map.whenReady(() => {
        setTimeout(() => {
          try { map.invalidateSize(); } catch {}
          if (pins.length > 1 && !focusSlug) {
            const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number]));
            if (userLoc) bounds.extend([userLoc.lat, userLoc.lng]);
            try { map.fitBounds(bounds, { padding: [40, 40], animate: false }); } catch {}
          } else if (focusSlug) {
            const f = pins.find((p) => p.slug === focusSlug);
            if (f) try { map.setView([f.lat, f.lng], 14, { animate: false }); } catch {}
          }
        }, 180);
      });
    };

    start();

    return () => {
      cancelled = true;
      if (retryId) clearTimeout(retryId);
      markers.forEach((m) => { try { m.remove(); } catch {} });
      const cur = containerRef.current;
      if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
      // Leaflet ninggalin _leaflet_id di container — bersihkan biar re-init aman
      if (cur) {
        // @ts-ignore
        if ((cur as any)._leaflet_id) delete (cur as any)._leaflet_id;
      }
    };
  }, [pinsKey, userLoc?.lat, userLoc?.lng, focusSlug, onSelect]);

  return <div ref={containerRef} className="h-[420px] w-full rounded-2xl overflow-hidden border border-[#EDE6D6] shadow-soft lg:h-[520px]" />;
}
