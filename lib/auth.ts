import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30일
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

const VIEWERS = [
  { name: "일송", envVar: "SITE_PASSWORD_ILSONG" },
  { name: "세희", envVar: "SITE_PASSWORD_SEHEE" },
] as const;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET 환경 변수가 설정되지 않았습니다.");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/** 입력한 비밀번호가 누구 것인지 식별합니다. 일치하는 사람이 없으면 null. */
export function identifyViewer(input: string): string | null {
  for (const { name, envVar } of VIEWERS) {
    const expected = process.env[envVar];
    if (!expected) continue;
    if (timingSafeEqualStrings(input, expected)) return name;
  }
  return null;
}

export function createSessionToken(viewer: string): string {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = Buffer.from(
    JSON.stringify({ exp: expiresAt, viewer })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** 세션 쿠키를 검증하고, 유효하면 { viewer }를 돌려줍니다. 무효/만료 시 null. */
export function verifySession(
  token: string | undefined | null
): { viewer: string } | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  if (!timingSafeEqualStrings(signature, sign(payload))) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp?: number; viewer?: string };

    if (!data.exp || !data.viewer) return null;
    if (Date.now() > data.exp) return null;

    return { viewer: data.viewer };
  } catch {
    return null;
  }
}
