import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE HYUNDAI RENTAL · 더현대 서울 물품 대여 관리",
  description: "사운즈 포레스트 감성의 실시간 물품 대여 및 반납 관리 시스템. 실시간 다중 사용자 동기화 지원.",
  keywords: ["더현대", "물품대여", "실시간", "더현대서울", "자산관리", "사운즈포레스트"],
  openGraph: {
    title: "THE HYUNDAI RENTAL · 더현대 서울 물품 대여 관리",
    description: "실시간 연동으로 누구나 동일한 대여 현황을 확인하고 반납/대여할 수 있습니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%200%20100%20100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%231D3728%22/><text y=%22.9em%22 x=%22.18em%22 font-size=%2280%22 font-family=%22serif%22 font-weight=%22bold%22 fill=%22%23E5DEC9%22>H</text></svg>" />
      </head>
      <body className="min-h-screen bg-[#FAF9F5] text-hyundai-charcoal selection:bg-hyundai-sageLight selection:text-hyundai-primary">
        {children}
      </body>
    </html>
  );
}
