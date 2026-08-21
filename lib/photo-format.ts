// 순수 포맷팅 함수만 모아둔 파일입니다. lib/drive.ts는 googleapis를 불러오기 때문에
// 클라이언트 컴포넌트에서 import하면 안 되고, 이 파일처럼 의존성 없는 순수 함수만
// 클라이언트/서버 양쪽에서 안전하게 재사용할 수 있습니다.

/** EXIF "YYYY:MM:DD HH:MM:SS" 촬영 시각을 "2026년 3월 17일 오전 8:25" 형태로. */
export function formatPhotoTakenAt(takenAt: string | null): string | null {
  if (!takenAt) return null;
  const match = takenAt.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/);
  if (!match) return null;

  const [, y, mo, d, h, mi] = match;
  const date = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi)
  );
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** 위도/경도를 "41.9072° N · 12.4532° E" 형태로. */
export function formatGpsCoordinate(
  latitude: number,
  longitude: number
): string {
  const latDir = latitude >= 0 ? "N" : "S";
  const lngDir = longitude >= 0 ? "E" : "W";
  return `${Math.abs(latitude).toFixed(4)}° ${latDir} · ${Math.abs(longitude).toFixed(4)}° ${lngDir}`;
}
