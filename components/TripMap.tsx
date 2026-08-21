"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

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

function FitBounds({ pins }: { pins: MapPin[] }) {
  const map = useMap();

  useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].latitude, pins[0].longitude], 12);
      return;
    }
    const bounds = L.latLngBounds(
      pins.map((pin) => [pin.latitude, pin.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [pins, map]);

  return null;
}

export default function TripMap({
  tripSlug,
  pins,
}: {
  tripSlug: string;
  pins: MapPin[];
}) {
  const router = useRouter();
  const center: [number, number] =
    pins.length > 0 ? [pins[0].latitude, pins[0].longitude] : [20, 0];

  return (
    <MapContainer
      center={center}
      zoom={pins.length > 0 ? 6 : 2}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds pins={pins} />
      {pins.map((pin) => (
        <Marker
          key={pin.albumSlug}
          position={[pin.latitude, pin.longitude]}
          icon={createPinIcon(pin)}
          eventHandlers={{
            click: () =>
              router.push(`/trip/${tripSlug}/album/${pin.albumSlug}`),
          }}
        />
      ))}
    </MapContainer>
  );
}
