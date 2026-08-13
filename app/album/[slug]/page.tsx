import Link from "next/link";
import { notFound } from "next/navigation";
import PhotoGrid from "@/components/PhotoGrid";
import SetupNotice from "@/components/SetupNotice";
import { getAlbumBySlug, listPhotos } from "@/lib/drive";
import type { Album, Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

type AlbumData =
  | { found: false }
  | { found: true; album: Album; photos: Photo[] };

async function loadAlbumData(slug: string): Promise<AlbumData> {
  const album = await getAlbumBySlug(slug);
  if (!album) return { found: false };

  const photos = await listPhotos(album.driveFolderId);
  return { found: true, album, photos };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  let data: AlbumData;
  try {
    data = await loadAlbumData(slug);
  } catch (error) {
    console.error("앨범을 불러오지 못했습니다:", error);
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <SetupNotice message="Google Drive 연동이 아직 설정되지 않았습니다." />
      </main>
    );
  }

  if (!data.found) {
    notFound();
  }

  const { album, photos } = data;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm text-neutral-400 hover:text-neutral-600"
        >
          ← 전체 앨범
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">
          {album.title}
        </h1>
        {album.description && (
          <p className="text-neutral-500">{album.description}</p>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="text-center text-neutral-400">
          이 앨범에는 아직 사진이 없어요.
        </p>
      ) : (
        <PhotoGrid photos={photos} />
      )}
    </main>
  );
}
