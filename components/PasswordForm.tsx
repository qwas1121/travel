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
      className="w-full max-w-sm flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200"
    >
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-neutral-600">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {error && (
        <p className="text-sm text-rose-500">비밀번호가 올바르지 않습니다.</p>
      )}

      <button
        type="submit"
        className="mt-2 rounded-lg bg-rose-400 px-4 py-2 font-medium text-white transition hover:bg-rose-500"
      >
        입장하기
      </button>
    </form>
  );
}
