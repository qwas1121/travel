import Link from "next/link";
import type { Album } from "@/lib/types";

const CARD_TINTS = [
  "oklch(90% 0.03 10 / 0.5)",
  "oklch(90% 0.035 60 / 0.5)",
  "oklch(90% 0.03 220 / 0.5)",
  "oklch(90% 0.03 40 / 0.5)",
  "oklch(90% 0.025 150 / 0.5)",
  "oklch(90% 0.03 280 / 0.5)",
];

export default function AlbumCard({
  album,
  coverThumbnail,
  photoCount,
  index,
}: {
  album: Album;
  coverThumbnail: string | null;
  photoCount: number;
  index: number;
}) {
  const tint = CARD_TINTS[index % CARD_TINTS.length];

  return (
    <Link
      href={`/album/${album.slug}`}
      className="group relative flex min-h-[190px] flex-col justify-between gap-3 overflow-hidden rounded-[24px] border border-white/60 p-4 shadow-[0_10px_26px_oklch(0%_0_0/0.07),inset_0_1px_0_oklch(100%_0_0/0.8)] transition-transform duration-300 hover:-translate-y-0.5"
    >
      {coverThumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverThumbnail}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: tint }} />
      )}

      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{
          background: `linear-gradient(160deg, oklch(100% 0 0 / 0.5), ${tint} 140%)`,
        }}
      />

      <span className="relative w-fit rounded-full bg-white/70 px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-accent">
        {photoCount}장
      </span>

      <div className="relative rounded-2xl bg-white/75 px-3 py-2 backdrop-blur-md">
        <div className="text-[17px] font-extrabold tracking-tight text-text-dark">
          {album.title}
        </div>
        {album.description && (
          <div className="mt-0.5 line-clamp-1 text-[11px] text-text-muted">
            {album.description}
          </div>
        )}
      </div>
    </Link>
  );
}
