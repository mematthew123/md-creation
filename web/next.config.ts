import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Point Next.js at the monorepo root so it traces files and resolves the
  // single root lockfile correctly instead of guessing.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  outputFileTracingRoot: path.join(__dirname, ".."),

  async rewrites() {
    return {
      // Content negotiation: the canonical URL serves markdown when asked for it.
      // beforeFiles so it wins over the HTML page at the same path.
      beforeFiles: [
        {
          source: "/:path*",
          has: [{ type: "header", key: "accept", value: "(.*)text/markdown(.*)" }],
          destination: "/md/:path*",
        },
      ],
      // Explicit, shareable Markdown URLs. afterFiles so app/sitemap.md wins first.
      // The negative lookahead keeps a request already rewritten to /md/... from
      // being rewritten a second time (e.g. /sitemap.md with Accept: text/markdown).
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
