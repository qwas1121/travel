import Link from "next/link";
import type { Album } from "@/lib/types";

export default function AlbumCard({
  album,
  coverThumbnail,
}: {
  album: Album;
  coverThumbnail: string | null;
}) {
  return (
    <Link
      href={`/album/${album.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100"
    >
      <div className="aspect-4/3 w-full overflow-hidden bg-rose-50/60">
        {coverThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverThumbnail}
            alt={album.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-rose-200">
            사진 없음
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-5">
        <h2 className="font-serif text-lg text-neutral-800">{album.title}</h2>
        {album.description && (
          <p className="text-sm text-neutral-500">{album.description}</p>
        )}
      </div>
    </Link>
  );
}
