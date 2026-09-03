import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Point Next.js at the monorepo root so it traces files and resolves the
  // single root lockfile correctly instead of guessing.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
