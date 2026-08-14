import PasswordForm from "@/components/PasswordForm";

const DEFAULT_SITE_TITLE = "우리의 여행";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const siteTitle =
    process.env.NEXT_PUBLIC_SITE_TITLE?.trim() || DEFAULT_SITE_TITLE;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-[11px] uppercase tracking-[0.35em] text-muted">
          Welcome
        </p>
        <h1 className="font-display text-4xl font-bold text-fg">
          {siteTitle}
        </h1>
        <p className="text-sm text-muted">
          비밀번호를 입력하면 여행을 볼 수 있어요
        </p>
      </div>
      <PasswordForm next={next && next.startsWith("/") ? next : "/"} error={error === "1"} />
    </main>
  );
}
