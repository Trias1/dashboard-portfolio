import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PortfolioKit  -  Buat Portfolio Profesional Gratis",
  description: "Platform portfolio profesional untuk semua profesi. Designer, developer, marketer  -  tampilkan dirimu secara profesional dalam menit. Gratis selamanya.",
  keywords: ["portfolio", "portfolio gratis", "buat portfolio", "portfolio profesional", "portfoliokit"],
  authors: [{ name: "P3ASK" }],
  openGraph: {
    title: "PortfolioKit  -  Buat Portfolio Profesional Gratis",
    description: "Tampilkan dirimu secara profesional. Gratis selamanya.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://portfolio.tzm.web.id",
    siteName: "PortfolioKit",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://portfolio.tzm.web.id"}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "PortfolioKit  -  Buat Portfolio Profesional Gratis",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PortfolioKit  -  Buat Portfolio Profesional Gratis",
    description: "Tampilkan dirimu secara profesional. Gratis selamanya.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || "https://portfolio.tzm.web.id"}/og-image.png`],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

