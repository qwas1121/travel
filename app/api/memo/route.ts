import { NextResponse, type NextRequest } from "next/server";
import { upsertAlbumMemo } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const driveFolderId =
    typeof body?.driveFolderId === "string" ? body.driveFolderId : null;
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";

  if (!driveFolderId || !description) {
    return NextResponse.json(
      { error: "내용을 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    await upsertAlbumMemo(driveFolderId, description.slice(0, 2000));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("메모 저장 실패:", error);
    return NextResponse.json(
      { error: "메모를 저장하지 못했습니다." },
      { status: 503 }
    );
  }
}
