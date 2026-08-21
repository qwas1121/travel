import Link from "next/link";
import type { Trip } from "@/lib/types";

export default function TripCard({
  trip,
  coverThumbnail,
}: {
  trip: Trip;
  coverThumbnail: string | null;
}) {
  return (
    <Link
      href={`/trip/${trip.slug}`}
      className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-2xl bg-surface transition-transform duration-300 hover:-translate-y-0.5"
    >
      {coverThumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverThumbnail}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 35%, oklch(0% 0 0 / 0.8) 100%)",
        }}
      />
      <div className="relative flex flex-col gap-1 p-5">
        <div className="font-display text-2xl font-bold leading-tight text-white">
          {trip.title}
        </div>
        {trip.description && (
          <div className="text-[13px] text-white/70">{trip.description}</div>
        )}
      </div>
    </Link>
  );
}
