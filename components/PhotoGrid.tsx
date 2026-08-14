"use client";

import { useState } from "react";
import type { Photo } from "@/lib/types";
import Lightbox from "./Lightbox";

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo, index) => (
          <div key={photo.driveFileId} className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group aspect-square w-full overflow-hidden rounded-2xl bg-surface"
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
                <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                  사진
                </div>
              )}
            </button>
            {photo.caption && (
              <p className="text-[11.5px] leading-snug text-muted">
                {photo.caption}
              </p>
            )}
          </div>
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
