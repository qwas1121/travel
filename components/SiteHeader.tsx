import ViewTabs from "./ViewTabs";

export default function SiteHeader() {
  return (
    <header className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] uppercase tracking-[0.3em] text-rose-400">
          Honeymoon
        </p>
        <h1 className="font-serif text-4xl font-normal text-neutral-900">
          신혼여행 포토북
        </h1>
        <p className="text-sm text-neutral-400">
          우리가 함께 걸었던 순간들
        </p>
      </div>
      <ViewTabs />
    </header>
  );
}
