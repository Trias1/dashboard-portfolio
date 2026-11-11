import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Local only: NEXT_DIST_DIR lets a new build go to another folder while a server keeps running on .next.
  // Unset (as on Vercel) it is the default .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Enable server actions & API routes
  serverExternalPackages: ["bcryptjs", "groq-sdk", "pdf2json"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
