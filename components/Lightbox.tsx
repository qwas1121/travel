"use client";

import { useCallback, useEffect } from "react";
import type { Photo } from "@/lib/types";
import CommentPanel from "./CommentPanel";

export default function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const photo = photos[index];

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + photos.length) % photos.length);
  }, [index, photos.length, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % photos.length);
  }, [index, photos.length, onIndexChange]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goPrev, goNext]);

  if (!photo) return null;

  const controlButton =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white/90 backdrop-blur-md transition hover:bg-white/20 hover:text-white";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3">
        <a
          href={`/api/image/${photo.driveFileId}?download=1&name=${encodeURIComponent(photo.name)}`}
          download={photo.name}
          className={controlButton}
          aria-label="다운로드"
        >
          ⬇
        </a>
        <button
          type="button"
          onClick={onClose}
          className={controlButton}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <div className="relative flex min-h-0 flex-[1.1] items-center justify-center px-3">
        {photos.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className={`${controlButton} absolute left-2 sm:left-4`}
            aria-label="이전 사진"
          >
            ‹
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/image/${photo.driveFileId}`}
          alt={photo.caption ?? photo.name}
          className="max-h-full max-w-full rounded-lg object-contain"
        />

        {photos.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            className={`${controlButton} absolute right-2 sm:right-4`}
            aria-label="다음 사진"
          >
            ›
          </button>
        )}
      </div>

      {photo.caption && (
        <p className="px-4 pb-2 text-center text-sm text-white/80">
          {photo.caption}
        </p>
      )}

      <CommentPanel key={photo.driveFileId} driveFileId={photo.driveFileId} />
    </div>
  );
}
