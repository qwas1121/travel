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
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 transition hover:shadow-md"
    >
      <div className="aspect-4/3 w-full overflow-hidden bg-neutral-100">
        {coverThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverThumbnail}
            alt={album.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            사진 없음
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h2 className="font-medium text-neutral-800">{album.title}</h2>
        {album.description && (
          <p className="text-sm text-neutral-500">{album.description}</p>
        )}
      </div>
    </Link>
  );
}
