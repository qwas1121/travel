import AlbumCard from "@/components/AlbumCard";
import SetupNotice from "@/components/SetupNotice";
import SiteHeader from "@/components/SiteHeader";
import { getAlbumCoverThumbnail, listAlbums } from "@/lib/drive";
import type { Album } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let albums: Album[];
  try {
    albums = await listAlbums();
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

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-12">
      <SiteHeader />

      {albums.length === 0 ? (
        <p className="text-center text-neutral-400">
          아직 등록된 앨범이 없어요. Google Drive 폴더에 사진을 올려보세요.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album, i) => (
            <AlbumCard key={album.slug} album={album} coverThumbnail={covers[i]} />
          ))}
        </div>
      )}

      <form action="/api/logout" method="POST" className="mt-4 text-center">
        <button
          type="submit"
          className="text-sm text-neutral-400 transition hover:text-rose-400"
        >
          로그아웃
        </button>
      </form>
    </main>
  );
}
