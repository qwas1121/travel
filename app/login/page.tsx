import PasswordForm from "@/components/PasswordForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-text-muted">
          Honeymoon
        </p>
        <h1 className="font-display text-3xl font-bold text-text-dark">
          신혼여행 포토북
        </h1>
        <p className="text-sm text-text-muted">
          비밀번호를 입력하면 사진을 볼 수 있어요
        </p>
      </div>
      <PasswordForm next={next && next.startsWith("/") ? next : "/"} error={error === "1"} />
    </main>
  );
}
