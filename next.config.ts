import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-91f361b1-6cc9-432f-8184-629cf4bdcd08.space-z.ai",
  ],
};

export default nextConfig;
