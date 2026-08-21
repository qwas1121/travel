"use client";

import { useCallback, useEffect, useRef } from "react";
import { formatGpsCoordinate, formatPhotoTakenAt } from "@/lib/photo-format";
import type { PhotoWithAlbum } from "@/lib/types";
import CommentPanel from "./CommentPanel";

const SWIPE_THRESHOLD = 50;

export default function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: PhotoWithAlbum[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const photo = photos[index];
  const touchStart = useRef<{ x: number; y: number } | null>(null);

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

  function handleTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx > 0) goPrev();
    else goNext();
  }

  const takenAtText = formatPhotoTakenAt(photo.takenAt);
  const cameraText = [
    photo.cameraModel,
    photo.aperture != null ? `f/${photo.aperture}` : null,
    photo.isoSpeed != null ? `ISO ${photo.isoSpeed}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const gpsText =
    photo.latitude != null && photo.longitude != null
      ? formatGpsCoordinate(photo.latitude, photo.longitude)
      : null;

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

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {photos.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className={`${controlButton} absolute left-2 z-10 sm:left-4`}
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
            className={`${controlButton} absolute right-2 z-10 sm:right-4`}
            aria-label="다음 사진"
          >
            ›
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 px-4 pb-2 pt-1 text-center">
        {photo.albumCity && (
          <p className="font-display text-base font-bold text-white">
            {photo.albumCity}
          </p>
        )}
        {photo.caption && (
          <p className="text-sm text-white/80">{photo.caption}</p>
        )}
        {(takenAtText || cameraText) && (
          <p className="text-xs text-white/50">
            {[takenAtText, cameraText || null].filter(Boolean).join(" · ")}
          </p>
        )}
        {gpsText && <p className="text-[11px] text-white/35">{gpsText}</p>}
      </div>

      <CommentPanel key={photo.driveFileId} driveFileId={photo.driveFileId} />
    </div>
  );
}
