import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InsightONE",
  description: "Smart SME Dashboard for ONE Albania",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col relative text-lg">
        {/* Animated gradient background */}
        <div className="fixed inset-0 z-0 animated-gradient-bg"></div>
        {/* Animated SVG blobs for eye candy */}
        <svg
          className="floating-svg left-10 top-10 blur-2xl animate-[floatY_8s_ease-in-out_infinite_alternate,wiggle_12s_ease-in-out_infinite]"
          width="180"
          height="180"
          viewBox="0 0 180 180"
          fill="none"
        >
          <ellipse
            cx="90"
            cy="90"
            rx="90"
            ry="70"
            fill="#818cf8"
            fillOpacity="0.5"
          />
        </svg>
        <svg
          className="floating-svg right-20 top-32 blur-3xl animate-[floatY_10s_ease-in-out_infinite_alternate-reverse,wiggle_14s_ease-in-out_infinite]"
          width="140"
          height="140"
          viewBox="0 0 140 140"
          fill="none"
        >
          <ellipse
            cx="70"
            cy="70"
            rx="70"
            ry="50"
            fill="#a5b4fc"
            fillOpacity="0.4"
          />
        </svg>
        <svg
          className="floating-svg left-1/2 bottom-10 blur-2xl animate-[floatY_12s_ease-in-out_infinite_alternate,wiggle_16s_ease-in-out_infinite]"
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
        >
          <ellipse
            cx="80"
            cy="80"
            rx="80"
            ry="60"
            fill="#6366f1"
            fillOpacity="0.3"
          />
        </svg>
        {/* Subtle animated sparkles */}
        <svg
          className="floating-svg left-1/3 top-1/4 animate-pulse"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="2" fill="#fff" fillOpacity="0.7" />
        </svg>
        <svg
          className="floating-svg right-1/4 bottom-1/3 animate-pulse"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
        >
          <circle cx="9" cy="9" r="1.5" fill="#fff" fillOpacity="0.5" />
        </svg>
        {/* Animated gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, #818cf8 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 min-h-screen flex flex-col overflow-y-auto">
          {children}
        </div>
        <style>{`
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.92) translateY(30px); }
            80% { opacity: 1; transform: scale(1.04) translateY(-4px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes splashFadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .splash-fadein {
            animation: splashFadeIn 0.7s cubic-bezier(0.4,0,0.2,1) both;
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-2deg) scale(1); }
            50% { transform: rotate(2deg) scale(1.04); }
          }
          @keyframes floatY {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .floating-svg {
            position: absolute;
            z-index: 0;
          }
          .btn-animated {
            transition: all 0.3s ease;
          }
          .btn-animated:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          .animate-fadeOut {
            animation: fadeOut 0.4s forwards;
          }
          @keyframes gradientMove {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .animated-gradient-bg {
            background: linear-gradient(120deg, #3a2fa4, #8e24aa, #5f3dc4, #3a2fa4);
            background-size: 200% 200%;
            animation: gradientMove 16s ease-in-out infinite;
          }
        `}</style>
      </body>
    </html>
  );
}
