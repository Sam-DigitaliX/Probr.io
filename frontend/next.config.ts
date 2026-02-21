import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" for Docker, omitted for Vercel (auto-detected)
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
