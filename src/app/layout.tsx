import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://portfolio.west-solutions.web.id"),
  title: "PortfolioKit - Build a Free Professional Portfolio",
  description: "A portfolio builder for any profession. Designers, developers, marketers: put your work online in minutes. Free.",
  keywords: ["portfolio", "free portfolio", "portfolio builder", "professional portfolio", "portfoliokit"],
  authors: [{ name: "Trias" }],
  openGraph: {
    title: "PortfolioKit - Build a Free Professional Portfolio",
    description: "Show your work in one clean page. Free.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://portfolio.west-solutions.web.id",
    siteName: "PortfolioKit",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://portfolio.west-solutions.web.id"}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "PortfolioKit - Build a Free Professional Portfolio",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PortfolioKit - Build a Free Professional Portfolio",
    description: "Show your work in one clean page. Free.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || "https://portfolio.west-solutions.web.id"}/og-image.png`],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}<Analytics /></body>
    </html>
  );
}

