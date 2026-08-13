import ViewTabs from "./ViewTabs";

export default function SiteHeader() {
  return (
    <header className="flex flex-col items-center gap-5 text-center">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-neutral-800">
          신혼여행 포토북
        </h1>
        <p className="text-sm text-neutral-500">
          우리가 함께 걸었던 순간들
        </p>
      </div>
      <ViewTabs />
    </header>
  );
}
