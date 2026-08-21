"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showNav = pathname !== "/login";

  return (
    <>
      <div className={`flex flex-1 flex-col ${showNav ? "pb-16" : ""}`}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </>
  );
}
