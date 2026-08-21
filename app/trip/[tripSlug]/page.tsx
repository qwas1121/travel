import { notFound } from "next/navigation";
import HomeView, {
  type AlbumWithMeta,
  type DateGroup,
} from "@/components/HomeView";
import SetupNotice from "@/components/SetupNotice";
import {
  formatDateKeyKorean,
  getAlbumCoverThumbnail,
  getTripBySlug,
  getTripDuration,
  listAlbums,
  listAllPhotos,
  photoDateKey,
} from "@/lib/drive";
import type { Album, PhotoWithAlbum, Trip } from "@/lib/types";

export const dynamic = "force-dynamic";

type TripData =
  | { found: false }
  | {
      found: true;
      trip: Trip;
      albums: Album[];
      allPhotos: PhotoWithAlbum[];
      covers: (string | null)[];
    };

async function loadTripData(slug: string): Promise<TripData> {
  const trip = await getTripBySlug(slug);
  if (!trip) return { found: false };

  const albums = await listAlbums(trip.driveFolderId);
  const [allPhotos, covers] = await Promise.all([
    listAllPhotos(albums),
    Promise.all(
      albums.map((album) => getAlbumCoverThumbnail(album).catch(() => null))
    ),
  ]);
  return { found: true, trip, albums, allPhotos, covers };
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ tripSlug: string }>;
}) {
  const { tripSlug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  let data: TripData;
  try {
    data = await loadTripData(slug);
  } catch (error) {
    console.error("여행 정보를 불러오지 못했습니다:", error);
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <SetupNotice message="Google Drive 연동이 아직 설정되지 않았습니다." />
      </main>
    );
  }

  if (!data.found) {
    notFound();
  }

  const { trip, albums, allPhotos, covers } = data;

  const photoCountByAlbum = new Map<string, number>();
  for (const photo of allPhotos) {
    photoCountByAlbum.set(
      photo.albumSlug,
      (photoCountByAlbum.get(photo.albumSlug) ?? 0) + 1
    );
  }

  const albumsWithMeta: AlbumWithMeta[] = albums.map((album, i) => ({
    ...album,
    coverThumbnail: covers[i],
    photoCount: photoCountByAlbum.get(album.slug) ?? 0,
  }));

  const groupsByDate = new Map<string, PhotoWithAlbum[]>();
  for (const photo of allPhotos) {
    const key = photoDateKey(photo);
    if (!key) continue;
    const list = groupsByDate.get(key) ?? [];
    list.push(photo);
    groupsByDate.set(key, list);
  }

  const dateGroups: DateGroup[] = [...groupsByDate.keys()].sort().map((dateKey) => {
    const photos = groupsByDate.get(dateKey)!;
    photos.sort((a, b) => (a.takenAt ?? "").localeCompare(b.takenAt ?? ""));
    return { dateKey, label: formatDateKeyKorean(dateKey), photos };
  });

  return (
    <HomeView
      tripSlug={trip.slug}
      tripTitle={trip.title}
      albums={albumsWithMeta}
      dateGroups={dateGroups}
      stats={{
        albumCount: albums.length,
        photoCount: allPhotos.length,
        duration: getTripDuration(allPhotos),
      }}
    />
  );
}
