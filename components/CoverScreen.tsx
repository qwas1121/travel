"use client";

import { useState } from "react";

export default function CoverScreen({
  coupleNames,
  subtitle,
}: {
  coupleNames: string;
  subtitle: string;
}) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <button
      type="button"
      onClick={() => setOpen(false)}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-bg px-8 text-center"
    >
      <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">
        Honeymoon
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-text-dark">
        {coupleNames}
      </h1>
      <p className="text-[13.5px] text-text-muted">{subtitle}</p>
      <span className="mt-4 rounded-full border border-hairline px-6 py-3 text-xs font-semibold tracking-wide text-accent">
        둘러보기 ↓
      </span>
    </button>
  );
}
