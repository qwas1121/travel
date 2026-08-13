export default function SetupNotice({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-amber-200/60 bg-amber-50/70 p-6 text-center text-sm text-amber-800 shadow-sm backdrop-blur-md">
      <p className="font-medium">아직 설정이 끝나지 않았어요</p>
      <p className="mt-1">{message}</p>
      <p className="mt-1">README.md의 설정 가이드를 확인해주세요.</p>
    </div>
  );
}
