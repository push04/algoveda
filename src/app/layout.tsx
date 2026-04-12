import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoVeda | Institutional Grade Market Intelligence",
  description: "AI-powered market research and trading intelligence platform for Indian retail investors. Backtest strategies, screen stocks, and get personalized market digests.",
  keywords: "stock screener, backtesting, paper trading, Indian markets, NSE, BSE, AI research, market intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#faf9f5] text-[#1b1c1a] font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
