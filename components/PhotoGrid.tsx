"use client";

import { useState } from "react";
import type { Photo } from "@/lib/types";
import Lightbox from "./Lightbox";

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.driveFileId}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group aspect-square overflow-hidden rounded-2xl border border-white/60 bg-white/40 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-rose-100"
          >
            {photo.thumbnailLink ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.thumbnailLink}
                alt={photo.caption ?? photo.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-rose-200">
                사진
              </div>
            )}
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          photos={photos}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}
    </>
  );
}
