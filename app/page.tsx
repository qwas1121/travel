import SetupNotice from "@/components/SetupNotice";
import TopBar from "@/components/TopBar";
import TripCard from "@/components/TripCard";
import { getTripCoverThumbnail, listTrips } from "@/lib/drive";
import type { Trip } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_SITE_TITLE = "우리의 여행";

export default async function TripPickerPage() {
  let trips: Trip[];
  try {
    trips = await listTrips();
  } catch (error) {
    console.error("여행 목록을 불러오지 못했습니다:", error);
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <SetupNotice message="Google Drive 연동이 아직 설정되지 않았습니다." />
      </main>
    );
  }

  const covers = await Promise.all(
    trips.map((trip) => getTripCoverThumbnail(trip).catch(() => null))
  );

  const siteTitle =
    process.env.NEXT_PUBLIC_SITE_TITLE?.trim() || DEFAULT_SITE_TITLE;

  return (
    <>
      <TopBar mode="list" wordmark={siteTitle} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-10 pt-5">
        {trips.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            아직 등록된 여행이 없어요. Google Drive에 폴더를 만들어보세요.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {trips.map((trip, index) => (
              <TripCard key={trip.slug} trip={trip} coverThumbnail={covers[index]} />
            ))}
          </div>
        )}

        <form action="/api/logout" method="POST" className="pt-2 text-center">
          <button
            type="submit"
            className="text-xs text-muted transition hover:text-accent"
          >
            로그아웃
          </button>
        </form>
      </div>
    </>
  );
}
