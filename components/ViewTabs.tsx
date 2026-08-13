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
    <nav className="inline-flex gap-8 border-b border-neutral-200">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 pb-2 text-sm tracking-wide transition-colors ${
              active
                ? "border-rose-400 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
