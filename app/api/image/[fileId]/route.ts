import { NextResponse } from "next/server";
import { getDriveFileStream } from "@/lib/drive";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  try {
    const { stream, mimeType } = await getDriveFileStream(fileId);
    return new Response(stream, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Drive 이미지 스트리밍 실패:", error);
    return NextResponse.json(
      { error: "이미지를 불러올 수 없습니다." },
      { status: 502 }
    );
  }
}
