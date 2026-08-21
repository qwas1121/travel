import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import AppShell from "@/components/AppShell";
import { ICON_BG } from "@/lib/app-icon";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const DEFAULT_SITE_TITLE = "우리의 여행";
const siteTitle =
  process.env.NEXT_PUBLIC_SITE_TITLE?.trim() || DEFAULT_SITE_TITLE;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteTitle,
  description: "우리의 여행 사진과 기록을 담은 포토북",
  appleWebApp: {
    capable: true,
    title: siteTitle,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: ICON_BG,
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col items-center bg-black text-fg">
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <div className="relative flex min-h-screen w-full max-w-[480px] flex-1 flex-col overflow-x-hidden border-x border-hairline bg-bg">
          <AppShell>{children}</AppShell>
        </div>
      </body>
    </html>
  );
}
