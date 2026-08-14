import Link from "next/link";
import type { ReactNode } from "react";

type TopBarProps = {
  rightSlot?: ReactNode;
} & (
  | { mode: "list"; wordmark: string }
  | { mode: "detail"; label: string; href: string }
);

export default function TopBar(props: TopBarProps) {
  return (
    <div className="sticky top-0 z-20 flex min-h-[52px] items-center justify-between border-b border-hairline bg-bg/75 px-5 py-3 backdrop-blur-md">
      {props.mode === "detail" ? (
        <Link
          href={props.href}
          className="flex min-h-11 items-center gap-1.5 text-[15px] text-fg"
        >
          <span className="text-lg">‹</span>
          <span>{props.label}</span>
        </Link>
      ) : (
        <div className="font-display text-base font-bold">
          {props.wordmark}
        </div>
      )}
      {props.rightSlot}
    </div>
  );
}
