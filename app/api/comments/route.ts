import { NextResponse, type NextRequest } from "next/server";
import { addPhotoComment, getPhotoComments } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("fileId");
  if (!fileId) {
    return NextResponse.json({ error: "fileId가 필요합니다." }, { status: 400 });
  }

  const { configured, comments } = await getPhotoComments(fileId);
  return NextResponse.json({ configured, comments });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const fileId = typeof body?.fileId === "string" ? body.fileId : null;
  const authorName =
    typeof body?.authorName === "string" ? body.authorName.trim() : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";

  if (!fileId || !authorName || !text) {
    return NextResponse.json(
      { error: "이름과 내용을 모두 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const comment = await addPhotoComment(
      fileId,
      authorName.slice(0, 40),
      text.slice(0, 1000)
    );
    return NextResponse.json({ comment });
  } catch (error) {
    console.error("댓글 저장 실패:", error);
    return NextResponse.json(
      { error: "댓글을 저장하지 못했습니다." },
      { status: 503 }
    );
  }
}
