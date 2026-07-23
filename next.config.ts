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
  experimental: {
    // Optimize barrel imports to reduce Turbopack module-graph resolution
    // and peak memory during compilation. Converts `import { X } from pkg`
    // into individual module imports so the bundler only resolves what's used.
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-icons",
      "framer-motion",
      "@tanstack/react-table",
      "@tanstack/react-query",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "date-fns",
      "react-hook-form",
      "sonner",
    ],
  },
};

export default nextConfig;
