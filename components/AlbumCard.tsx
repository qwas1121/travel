import Link from "next/link";
import type { Album } from "@/lib/types";

export default function AlbumCard({
  tripSlug,
  album,
  coverThumbnail,
  photoCount,
}: {
  tripSlug: string;
  album: Album;
  coverThumbnail: string | null;
  photoCount: number;
}) {
  return (
    <Link
      href={`/trip/${tripSlug}/album/${album.slug}`}
      className="group relative flex h-[170px] flex-col justify-end overflow-hidden rounded-2xl bg-surface transition-transform duration-300 hover:-translate-y-0.5"
    >
      {coverThumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverThumbnail}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 40%, oklch(0% 0 0 / 0.82) 100%)",
        }}
      />
      <span className="absolute right-2.5 top-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
        {photoCount}장
      </span>

      <div className="relative flex flex-col gap-0.5 p-3.5">
        <div className="text-[15px] font-bold leading-tight text-white">
          {album.title}
        </div>
        {album.description && (
          <div className="line-clamp-1 text-[11px] text-white/70">
            {album.description}
          </div>
        )}
      </div>
    </Link>
  );
}
