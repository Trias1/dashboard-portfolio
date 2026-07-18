import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable server actions & API routes
  serverExternalPackages: ["bcryptjs", "groq-sdk", "pdf2json"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
