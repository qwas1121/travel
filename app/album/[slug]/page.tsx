import { notFound } from "next/navigation";
import PhotoGrid from "@/components/PhotoGrid";
import SetupNotice from "@/components/SetupNotice";
import TopBar from "@/components/TopBar";
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
    <>
      <TopBar mode="detail" label={album.title} href="/" />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-10 pt-5">
        {album.description && (
          <div
            className="rounded-[18px] border border-white/60 p-4 backdrop-blur-[18px] shadow-[0_8px_20px_oklch(0%_0_0/0.05),inset_0_1px_0_oklch(100%_0_0/0.8)]"
            style={{
              background:
                "linear-gradient(160deg, oklch(100% 0 0 / 0.6), var(--color-chip) 130%)",
            }}
          >
            <div className="mb-1 text-[10.5px] font-bold tracking-wide text-accent">
              MEMO
            </div>
            <div className="text-[13.5px] leading-relaxed text-text-dark">
              {album.description}
            </div>
          </div>
        )}

        {photos.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-muted">
            이 앨범에는 아직 사진이 없어요.
          </p>
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </div>
    </>
  );
}
