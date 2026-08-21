import { notFound } from "next/navigation";
import SetupNotice from "@/components/SetupNotice";
import TopBar from "@/components/TopBar";
import TripMapLoader from "@/components/TripMapLoader";
import {
  getAlbumCoverThumbnail,
  getTripBySlug,
  listAlbums,
  listPhotos,
} from "@/lib/drive";
import type { Trip } from "@/lib/types";
import type { MapPin } from "@/components/TripMap";

export const dynamic = "force-dynamic";

type MapData = { found: false } | { found: true; trip: Trip; pins: MapPin[] };

async function loadMapData(tripSlug: string): Promise<MapData> {
  const trip = await getTripBySlug(tripSlug);
  if (!trip) return { found: false };

  const albums = await listAlbums(trip.driveFolderId);
  const pins: MapPin[] = [];

  for (const album of albums) {
    const photos = await listPhotos(album.driveFolderId);
    const geotagged = photos.find(
      (photo) => photo.latitude != null && photo.longitude != null
    );
    if (!geotagged || geotagged.latitude == null || geotagged.longitude == null) {
      continue;
    }

    const coverThumbnail = await getAlbumCoverThumbnail(album).catch(
      () => null
    );
    pins.push({
      albumSlug: album.slug,
      title: album.title,
      coverThumbnail,
      latitude: geotagged.latitude,
      longitude: geotagged.longitude,
    });
  }

  return { found: true, trip, pins };
}

export default async function TripMapPage({
  params,
}: {
  params: Promise<{ tripSlug: string }>;
}) {
  const { tripSlug: rawSlug } = await params;
  const tripSlug = decodeURIComponent(rawSlug);

  let data: MapData;
  try {
    data = await loadMapData(tripSlug);
  } catch (error) {
    console.error("지도 데이터를 불러오지 못했습니다:", error);
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <SetupNotice message="Google Drive 연동이 아직 설정되지 않았습니다." />
      </main>
    );
  }

  if (!data.found) {
    notFound();
  }

  const { trip, pins } = data;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar mode="detail" label={trip.title} href={`/trip/${trip.slug}`} />
      {pins.length === 0 ? (
        <p className="flex-1 px-5 py-10 text-center text-sm text-muted">
          위치 정보가 있는 사진이 없어요.
        </p>
      ) : (
        <div className="relative min-h-0 flex-1">
          <TripMapLoader tripSlug={trip.slug} pins={pins} />
        </div>
      )}
    </div>
  );
}
