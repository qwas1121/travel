"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const tripSlugMatch = pathname.match(/^\/trip\/([^/]+)/);
  const currentTripSlug = tripSlugMatch ? tripSlugMatch[1] : null;

  const homeHref = currentTripSlug ? `/trip/${currentTripSlug}` : "/";
  const mapHref = currentTripSlug ? `/trip/${currentTripSlug}/map` : "/";

  const items = [
    {
      href: homeHref,
      label: "홈",
      icon: "🏠",
      active: currentTripSlug !== null && pathname === homeHref,
    },
    {
      href: mapHref,
      label: "지도",
      icon: "🗺️",
      active: currentTripSlug !== null && pathname === mapHref,
    },
    {
      href: "/",
      label: "여행 목록",
      icon: "🧳",
      active: pathname === "/",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-hairline bg-surface/90 backdrop-blur-xl">
      <div className="flex items-stretch justify-around">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors ${
              item.active ? "text-accent" : "text-muted"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
