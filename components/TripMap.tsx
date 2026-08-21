"use client";

import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type MapPin = {
  albumSlug: string;
  title: string;
  coverThumbnail: string | null;
  latitude: number;
  longitude: number;
};

function createPinIcon(pin: MapPin) {
  const imageHtml = pin.coverThumbnail
    ? `<img src="${pin.coverThumbnail}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;">💕</div>`;
  return L.divIcon({
    className: "map-pin",
    html: `<div style="width:52px;height:52px;border-radius:50%;overflow:hidden;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(236,111,154,0.55);background:#1f1c1a;">${imageHtml}</div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

export default function TripMap({
  tripSlug,
  pins,
}: {
  tripSlug: string;
  pins: MapPin[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [status, setStatus] = useState<
    "loading" | "ready" | "tile-error" | "init-error"
  >("loading");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let map: L.Map | null = null;
    let resizeObserver: ResizeObserver | null = null;

    try {
      map = L.map(containerRef.current, {
        center:
          pins.length > 0 ? [pins[0].latitude, pins[0].longitude] : [20, 0],
        zoom: pins.length > 0 ? 6 : 2,
      });

      const tileLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      tileLayer.on("tileerror", (e) => {
        console.error("지도 타일 로드 실패:", e);
        setStatus("tile-error");
      });
      tileLayer.on("load", () => {
        setStatus((prev) => (prev === "loading" ? "ready" : prev));
      });

      for (const pin of pins) {
        L.marker([pin.latitude, pin.longitude], { icon: createPinIcon(pin) })
          .addTo(map)
          .on("click", () => {
            router.push(`/trip/${tripSlug}/album/${pin.albumSlug}`);
          });
      }

      if (pins.length > 1) {
        const bounds = L.latLngBounds(
          pins.map((pin) => [pin.latitude, pin.longitude] as [number, number])
        );
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      resizeObserver = new ResizeObserver(() => {
        map?.invalidateSize();
      });
      resizeObserver.observe(containerRef.current);
    } catch (err) {
      console.error("지도 초기화 실패:", err);
      const message = err instanceof Error ? err.message : String(err);
      queueMicrotask(() => {
        setStatus("init-error");
        setErrorDetail(message);
      });
    }

    return () => {
      resizeObserver?.disconnect();
      map?.remove();
    };
  }, [pins, tripSlug, router]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />
      {status === "init-error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg p-6 text-center text-sm text-muted">
          <p>지도를 초기화하지 못했어요.</p>
          {errorDetail && (
            <p className="text-xs text-muted/70">{errorDetail}</p>
          )}
        </div>
      )}
      {status === "tile-error" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-black/70 px-3 py-2 text-center text-xs text-white">
          지도 타일을 불러오지 못했어요 (네트워크 확인 필요)
        </div>
      )}
    </div>
  );
}
