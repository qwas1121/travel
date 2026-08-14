"use client";

import { useState } from "react";
import AlbumCard from "./AlbumCard";
import PhotoGrid from "./PhotoGrid";
import TopBar from "./TopBar";
import type { Album, PhotoWithAlbum } from "@/lib/types";

export type AlbumWithMeta = Album & {
  coverThumbnail: string | null;
  photoCount: number;
};

export type DateGroup = {
  dateKey: string;
  label: string;
  photos: PhotoWithAlbum[];
};

export default function HomeView({
  tripSlug,
  tripTitle,
  albums,
  dateGroups,
  stats,
}: {
  tripSlug: string;
  tripTitle: string;
  albums: AlbumWithMeta[];
  dateGroups: DateGroup[];
  stats: { albumCount: number; photoCount: number; duration: string | null };
}) {
  const [mode, setMode] = useState<"folders" | "date">("folders");

  return (
    <>
      <TopBar mode="detail" label={tripTitle} href="/" />

      <div className="flex flex-1 flex-col">
        <section className="flex flex-col items-center gap-2.5 px-5 pb-2 pt-6 text-center">
          {stats.duration && (
            <p className="text-[13px] text-muted">{stats.duration}</p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-chip px-3.5 py-1.5 text-xs text-accent">
              {stats.albumCount}개 앨범
            </span>
            <span className="rounded-full bg-chip px-3.5 py-1.5 text-xs text-accent">
              사진 {stats.photoCount}장
            </span>
          </div>
        </section>

        <section className="flex justify-center px-5 pb-2 pt-4">
          <div className="inline-flex gap-0.5 rounded-full bg-chip p-1">
            <button
              type="button"
              onClick={() => setMode("folders")}
              className={`min-h-11 rounded-full px-4.5 text-[13.5px] font-semibold transition ${
                mode === "folders"
                  ? "bg-chip-active text-fg"
                  : "text-muted"
              }`}
            >
              폴더별
            </button>
            <button
              type="button"
              onClick={() => setMode("date")}
              className={`min-h-11 rounded-full px-4.5 text-[13.5px] font-semibold transition ${
                mode === "date" ? "bg-chip-active text-fg" : "text-muted"
              }`}
            >
              날짜별
            </button>
          </div>
        </section>

        {mode === "folders" ? (
          albums.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              아직 등록된 앨범이 없어요. Google Drive 폴더에 사진을 올려보세요.
            </p>
          ) : (
            <section className="grid grid-cols-2 gap-3 px-5 pb-10 pt-3">
              {albums.map((album) => (
                <AlbumCard
                  key={album.slug}
                  tripSlug={tripSlug}
                  album={album}
                  coverThumbnail={album.coverThumbnail}
                  photoCount={album.photoCount}
                />
              ))}
            </section>
          )
        ) : dateGroups.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            아직 사진이 없어요.
          </p>
        ) : (
          <section className="flex flex-col gap-9 px-5 pb-10 pt-3">
            {dateGroups.map((group) => (
              <div key={group.dateKey} className="flex flex-col gap-3">
                <h2 className="border-b border-hairline pb-2 font-display text-lg font-bold text-fg">
                  {group.label}
                </h2>
                <PhotoGrid photos={group.photos} />
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
