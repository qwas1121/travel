"use client";

import { useCallback, useEffect } from "react";
import type { Photo } from "@/lib/types";

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
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-white/90 backdrop-blur-md transition hover:bg-white/20 hover:text-white";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className={`${controlButton} absolute right-4 top-4`}
        aria-label="닫기"
      >
        ✕
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
          className={`${controlButton} absolute left-3 sm:left-6`}
          aria-label="이전 사진"
        >
          ‹
        </button>
      )}

      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-full max-w-full flex-col items-center gap-3"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/image/${photo.driveFileId}`}
          alt={photo.caption ?? photo.name}
          className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-lg"
        />
        {photo.caption && (
          <p className="text-sm text-white/80">{photo.caption}</p>
        )}
      </div>

      {photos.length > 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
          className={`${controlButton} absolute right-3 sm:right-6`}
          aria-label="다음 사진"
        >
          ›
        </button>
      )}
    </div>
  );
}
