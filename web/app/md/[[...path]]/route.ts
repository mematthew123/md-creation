import { markdownPageResponse, sitemapMarkdownResponse } from "@/lib/markdown/serve";
import { pathFromMdSegments } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Single markdown handler. Reached via next.config rewrites:
 *   /about.md                       -> /md/about
 *   /about  (Accept: text/markdown) -> /md/about
 *   /       (Accept: text/markdown) -> /md
 */
export async function GET(_request: Request, ctx: RouteContext<"/md/[[...path]]">) {
  const { path } = await ctx.params;
  // /sitemap.md requested with Accept: text/markdown lands here too.
  if (path?.length === 1 && path[0] === "sitemap.md") {
    return sitemapMarkdownResponse();
  }
  return markdownPageResponse(pathFromMdSegments(path));
}
