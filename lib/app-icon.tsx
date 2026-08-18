export const ICON_BG = "#141210";
export const ICON_ACCENT = "#ec6f9a";

/** PWA 아이콘/favicon/apple-touch-icon에서 공통으로 쓰는 아이콘 도안. */
export function appIconElement() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ICON_BG,
      }}
    >
      <div
        style={{
          width: "56%",
          height: "56%",
          borderRadius: "50%",
          background: ICON_ACCENT,
          display: "flex",
        }}
      />
    </div>
  );
}
