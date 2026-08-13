import CoverScreen from "@/components/CoverScreen";
import HomeView, {
  type AlbumWithMeta,
  type DateGroup,
} from "@/components/HomeView";
import SetupNotice from "@/components/SetupNotice";
import {
  formatDateKeyKorean,
  getAlbumCoverThumbnail,
  getTripDuration,
  listAlbums,
  listAllPhotos,
  photoDateKey,
} from "@/lib/drive";
import type { Album, PhotoWithAlbum } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_COUPLE_NAMES = "우리";
const DEFAULT_TRIP_SUBTITLE = "함께 걸었던 순간들을 담았어요";
const DEFAULT_TRIP_TITLE = "우리의 신혼여행";

export default async function HomePage() {
  let albums: Album[];
  let allPhotos: PhotoWithAlbum[];
  try {
    [albums, allPhotos] = await Promise.all([listAlbums(), listAllPhotos()]);
  } catch (error) {
    console.error("앨범 목록을 불러오지 못했습니다:", error);
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <SetupNotice message="Google Drive 연동이 아직 설정되지 않았습니다." />
      </main>
    );
  }

  const covers = await Promise.all(
    albums.map((album) => getAlbumCoverThumbnail(album).catch(() => null))
  );

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

  const coupleNames =
    process.env.NEXT_PUBLIC_COUPLE_NAMES?.trim() || DEFAULT_COUPLE_NAMES;
  const tripSubtitle =
    process.env.NEXT_PUBLIC_TRIP_SUBTITLE?.trim() || DEFAULT_TRIP_SUBTITLE;
  const tripTitle =
    process.env.NEXT_PUBLIC_TRIP_TITLE?.trim() || DEFAULT_TRIP_TITLE;

  return (
    <>
      <CoverScreen coupleNames={coupleNames} subtitle={tripSubtitle} />
      <HomeView
        coupleNames={coupleNames}
        tripTitle={tripTitle}
        albums={albumsWithMeta}
        dateGroups={dateGroups}
        stats={{
          albumCount: albums.length,
          photoCount: allPhotos.length,
          duration: getTripDuration(allPhotos),
        }}
      />
    </>
  );
}
