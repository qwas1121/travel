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
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-hairline bg-white p-8 shadow-sm"
    >
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-text-muted">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="rounded-lg border border-hairline px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-chip"
        />
      </div>

      {error && (
        <p className="text-sm text-accent">비밀번호가 올바르지 않습니다.</p>
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
