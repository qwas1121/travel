export default function SetupNotice({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center text-sm text-amber-300">
      <p className="font-medium">아직 설정이 끝나지 않았어요</p>
      <p className="mt-1">{message}</p>
      <p className="mt-1">README.md의 설정 가이드를 확인해주세요.</p>
    </div>
  );
}
