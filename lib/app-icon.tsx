import { readFileSync } from "node:fs";
import path from "node:path";

export const ICON_BG = "#141210";
export const ICON_ACCENT = "#ec6f9a";

function loadIllustrationDataUri(): string | null {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "cover-illustration.png"
    );
    const bytes = readFileSync(filePath);
    return `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

const illustrationDataUri = loadIllustrationDataUri();

/** PWA 아이콘/favicon/apple-touch-icon에서 공통으로 쓰는 아이콘 도안. */
export function appIconElement(sizePx: number) {
  if (illustrationDataUri) {
    return (
      <div
        style={{
          width: sizePx,
          height: sizePx,
          display: "flex",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={illustrationDataUri}
          alt=""
          width={sizePx}
          height={sizePx}
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: sizePx,
        height: sizePx,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ICON_BG,
      }}
    >
      <div
        style={{
          width: sizePx * 0.56,
          height: sizePx * 0.56,
          borderRadius: "50%",
          background: ICON_ACCENT,
          display: "flex",
        }}
      />
    </div>
  );
}
