import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hyundai: {
          dark: "#14251D",      // 더현대 포레스트 딥 그린
          primary: "#1D3728",   // 메인 사운즈 포레스트 그린
          accent: "#2D543F",    // 버튼 & 액센트 그린
          sage: "#738C7E",      // 보조 세이지 그린
          sageLight: "#E8EFEA", // 연한 세이지 배경
          cream: "#FAF9F5",     // 메인 크림 베이지 배경
          creamDark: "#F0EDE4", // 카드/구분선 베이지
          gold: "#B89758",      // 럭셔리 골드 포인트
          sand: "#E5DEC9",
          charcoal: "#232624",  // 본문 텍스트
          muted: "#6B726C",     // 보조 텍스트
          available: "#2E7D52", // 대여 가능 에메랄드
          availableBg: "#EBF7F0",
          loaned: "#B25E2B",    // 대여 중 테라코타
          loanedBg: "#FDF2EC",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-pretendard)", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'hyundai': '0 4px 20px -2px rgba(29, 55, 40, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'hyundai-hover': '0 12px 32px -4px rgba(29, 55, 40, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 25px 50px -12px rgba(20, 37, 29, 0.25)',
      },
      borderRadius: {
        'luxury': '16px',
        'luxury-lg': '24px',
      }
    },
  },
  plugins: [],
};
export default config;
