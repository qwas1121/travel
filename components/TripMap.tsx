"use client";

import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export type MapPin = {
  albumSlug: string;
  title: string;
  coverThumbnail: string | null;
  latitude: number;
  longitude: number;
};

function createPinIcon(pin: MapPin) {
  const imageHtml = pin.coverThumbnail
    ? `<img src="${pin.coverThumbnail}" style="width:100%;height:100%;object-fit:cover;" />`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="width:48px;height:48px;border-radius:50%;overflow:hidden;border:2px solid #ec6f9a;box-shadow:0 2px 8px rgba(0,0,0,0.45);background:#1f1c1a;">${imageHtml}</div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
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

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center:
        pins.length > 0 ? [pins[0].latitude, pins[0].longitude] : [20, 0],
      zoom: pins.length > 0 ? 6 : 2,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

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

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
    };
  }, [pins, tripSlug, router]);

  return <div ref={containerRef} className="h-full w-full" />;
}
