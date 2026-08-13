"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "장소별" },
  { href: "/by-date", label: "날짜별" },
];

export default function ViewTabs() {
  const pathname = usePathname();

  return (
    <div className="inline-flex gap-1 rounded-full border border-white/60 bg-white/50 p-1 shadow-sm backdrop-blur-md">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-5 py-1.5 text-sm transition-colors ${
              active
                ? "bg-rose-400 text-white shadow-sm"
                : "text-neutral-500 hover:text-rose-500"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
