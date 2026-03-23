import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid Turbopack bundling a stale @prisma/client snapshot missing user/category delegates.
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
