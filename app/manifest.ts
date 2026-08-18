import type { MetadataRoute } from "next";
import { ICON_BG } from "@/lib/app-icon";

const DEFAULT_SITE_TITLE = "우리의 여행";

export default function manifest(): MetadataRoute.Manifest {
  const siteTitle =
    process.env.NEXT_PUBLIC_SITE_TITLE?.trim() || DEFAULT_SITE_TITLE;

  return {
    name: siteTitle,
    short_name: siteTitle,
    description: "우리의 여행 사진과 기록을 담은 포토북",
    start_url: "/",
    display: "standalone",
    background_color: ICON_BG,
    theme_color: ICON_BG,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
