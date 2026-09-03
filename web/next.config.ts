import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo root: single lockfile lives there.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  outputFileTracingRoot: path.join(__dirname, ".."),

  async rewrites() {
    return {
      // Accept: text/markdown -> markdown handler (beforeFiles to beat the HTML page).
      beforeFiles: [
        {
          source: "/:path*",
          has: [{ type: "header", key: "accept", value: "(.*)text/markdown(.*)" }],
          destination: "/md/:path*",
        },
      ],
      // /slug.md -> markdown handler; lookahead avoids rewriting /md/... twice.
      afterFiles: [
        {
          source: "/:path((?!md/).*)\\.md",
          destination: "/md/:path",
        },
      ],
    };
  },
};

export default nextConfig;
