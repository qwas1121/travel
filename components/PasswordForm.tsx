export default function PasswordForm({
  next,
  error,
}: {
  next: string;
  error: boolean;
}) {
  return (
    <form
      action="/api/login"
      method="POST"
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-hairline bg-surface p-8"
    >
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="password" className="text-sm text-muted">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="rounded-lg border border-hairline bg-black/20 px-3 py-2 text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {error && (
        <p className="text-left text-sm text-accent">
          비밀번호가 올바르지 않습니다.
        </p>
      )}

      <button
        type="submit"
        className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:opacity-90"
      >
        입장하기
      </button>
    </form>
  );
}
