import { notFound } from "next/navigation";
import MemoEditor from "@/components/MemoEditor";
import PhotoGrid from "@/components/PhotoGrid";
import SetupNotice from "@/components/SetupNotice";
import TopBar from "@/components/TopBar";
import { getAlbumBySlug, getTripBySlug, listPhotos } from "@/lib/drive";
import type { Album, PhotoWithAlbum, Trip } from "@/lib/types";

export const dynamic = "force-dynamic";

type AlbumData =
  | { found: false }
  | { found: true; trip: Trip; album: Album; photos: PhotoWithAlbum[] };

async function loadAlbumData(
  tripSlug: string,
  albumSlug: string
): Promise<AlbumData> {
  const trip = await getTripBySlug(tripSlug);
  if (!trip) return { found: false };

  const album = await getAlbumBySlug(trip.driveFolderId, albumSlug);
  if (!album) return { found: false };

  const rawPhotos = await listPhotos(album.driveFolderId);
  const photos: PhotoWithAlbum[] = rawPhotos.map((photo) => ({
    ...photo,
    albumSlug: album.slug,
    albumTitle: album.title,
    albumCity: album.city,
  }));
  return { found: true, trip, album, photos };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ tripSlug: string; albumSlug: string }>;
}) {
  const { tripSlug: rawTripSlug, albumSlug: rawAlbumSlug } = await params;
  const tripSlug = decodeURIComponent(rawTripSlug);
  const albumSlug = decodeURIComponent(rawAlbumSlug);

  let data: AlbumData;
  try {
    data = await loadAlbumData(tripSlug, albumSlug);
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

  const { trip, album, photos } = data;

  return (
    <>
      <TopBar
        mode="detail"
        label={album.title}
        href={`/trip/${trip.slug}`}
      />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-10 pt-5">
        <MemoEditor
          driveFolderId={album.driveFolderId}
          initialDescription={album.description}
        />

        {photos.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            이 앨범에는 아직 사진이 없어요.
          </p>
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </div>
    </>
  );
}
