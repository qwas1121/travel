import PhotoGrid from "@/components/PhotoGrid";
import SetupNotice from "@/components/SetupNotice";
import SiteHeader from "@/components/SiteHeader";
import { formatDateKeyKorean, listAllPhotos, photoDateKey } from "@/lib/drive";
import type { PhotoWithAlbum } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ByDatePage() {
  let photos: PhotoWithAlbum[];
  try {
    photos = await listAllPhotos();
  } catch (error) {
    console.error("사진을 불러오지 못했습니다:", error);
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <SetupNotice message="Google Drive 연동이 아직 설정되지 않았습니다." />
      </main>
    );
  }

  const groups = new Map<string, PhotoWithAlbum[]>();
  const undated: PhotoWithAlbum[] = [];

  for (const photo of photos) {
    const key = photoDateKey(photo);
    if (!key) {
      undated.push(photo);
      continue;
    }
    const list = groups.get(key) ?? [];
    list.push(photo);
    groups.set(key, list);
  }

  const sortedKeys = [...groups.keys()].sort();
  for (const key of sortedKeys) {
    groups
      .get(key)!
      .sort((a, b) => (a.takenAt ?? "").localeCompare(b.takenAt ?? ""));
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-12">
      <SiteHeader />

      {sortedKeys.length === 0 && undated.length === 0 ? (
        <p className="text-center text-neutral-400">아직 사진이 없어요.</p>
      ) : (
        <div className="flex flex-col gap-12">
          {sortedKeys.map((key) => (
            <section key={key} className="flex flex-col gap-3">
              <h2 className="font-serif text-xl text-neutral-700">
                {formatDateKeyKorean(key)}
              </h2>
              <PhotoGrid photos={groups.get(key)!} />
            </section>
          ))}

          {undated.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-serif text-xl text-neutral-700">
                날짜 미상
              </h2>
              <PhotoGrid photos={undated} />
            </section>
          )}
        </div>
      )}
    </main>
  );
}
