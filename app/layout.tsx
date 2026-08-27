import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "핀프렌즈 프로토타입",
  description: "시각 확인용 3화면 프로토타입",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
