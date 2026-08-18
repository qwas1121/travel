import { NextResponse, type NextRequest } from "next/server";
import { getDriveFileStream } from "@/lib/drive";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const download = request.nextUrl.searchParams.get("download");
  const name = request.nextUrl.searchParams.get("name");

  try {
    const { stream, mimeType } = await getDriveFileStream(fileId);
    const headers: HeadersInit = {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    if (download) {
      const filename = (name || `${fileId}.jpg`).replace(/["\r\n]/g, "");
      headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    }

    return new Response(stream, { headers });
  } catch (error) {
    console.error("Drive 이미지 스트리밍 실패:", error);
    return NextResponse.json(
      { error: "이미지를 불러올 수 없습니다." },
      { status: 502 }
    );
  }
}
