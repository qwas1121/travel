"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./TripMap";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">
      지도를 불러오는 중...
    </div>
  ),
});

export default function TripMapLoader({
  tripSlug,
  pins,
}: {
  tripSlug: string;
  pins: MapPin[];
}) {
  return <TripMap tripSlug={tripSlug} pins={pins} />;
}
