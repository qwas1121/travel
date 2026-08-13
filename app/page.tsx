import Link from "next/link";
import AlbumCard from "@/components/AlbumCard";
import SetupNotice from "@/components/SetupNotice";
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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold text-neutral-800">
          신혼여행 포토북
        </h1>
        <p className="text-neutral-500">우리가 함께 걸었던 순간들</p>
        <Link
          href="/by-date"
          className="mt-1 text-sm text-rose-400 hover:text-rose-500"
        >
          📅 날짜별로 보기
        </Link>
      </header>

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
          className="text-sm text-neutral-400 hover:text-neutral-600"
        >
          로그아웃
        </button>
      </form>
    </main>
  );
}
