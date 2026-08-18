// PWA 매니페스트용 정적 아이콘(192px, 512px)을 public/ 에 생성합니다.
// 아이콘 도안을 바꾸고 싶으면 lib/app-icon.tsx 를 수정한 뒤 다시 실행하세요:
//   npx tsx scripts/generate-icons.ts
import { writeFileSync } from "node:fs";
import { ImageResponse } from "next/og";
import { appIconElement } from "../lib/app-icon";

async function generate(sizePx: number, outPath: string) {
  const response = new ImageResponse(appIconElement(sizePx), {
    width: sizePx,
    height: sizePx,
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(outPath, buffer);
  console.log(`wrote ${outPath} (${buffer.length} bytes)`);
}

async function main() {
  await generate(192, "public/icon-192.png");
  await generate(512, "public/icon-512.png");
}

main();
