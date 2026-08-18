import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionToken,
  identifyViewer,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("next") ?? "/");
  const next = rawNext.startsWith("/") ? rawNext : "/";

  let viewer: string | null = null;
  try {
    viewer = identifyViewer(password);
  } catch {
    viewer = null;
  }

  if (!viewer) {
    const failUrl = new URL("/login", request.url);
    failUrl.searchParams.set("error", "1");
    failUrl.searchParams.set("next", next);
    return NextResponse.redirect(failUrl, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(next, request.url), {
    status: 303,
  });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(viewer), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
