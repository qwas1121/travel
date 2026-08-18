import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";
import { addPhotoComment, getPhotoComments } from "@/lib/supabase";

async function getViewer(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  return session?.viewer ?? null;
}

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("fileId");
  if (!fileId) {
    return NextResponse.json({ error: "fileId가 필요합니다." }, { status: 400 });
  }

  const viewer = await getViewer();
  const { configured, comments } = await getPhotoComments(fileId);
  return NextResponse.json({ configured, comments, viewer });
}

export async function POST(request: NextRequest) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const fileId = typeof body?.fileId === "string" ? body.fileId : null;
  const text = typeof body?.body === "string" ? body.body.trim() : "";

  if (!fileId || !text) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  try {
    const comment = await addPhotoComment(fileId, viewer, text.slice(0, 1000));
    return NextResponse.json({ comment });
  } catch (error) {
    console.error("댓글 저장 실패:", error);
    return NextResponse.json(
      { error: "댓글을 저장하지 못했습니다." },
      { status: 503 }
    );
  }
}
