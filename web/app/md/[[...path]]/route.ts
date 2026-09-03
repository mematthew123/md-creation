import { markdownPageResponse, sitemapMarkdownResponse } from "@/lib/markdown/serve";
import { pathFromMdSegments } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Target of the next.config rewrites for /slug.md and Accept: text/markdown. */
export async function GET(_request: Request, ctx: RouteContext<"/md/[[...path]]">) {
  const { path } = await ctx.params;
  if (path?.length === 1 && path[0] === "sitemap.md") {
    return sitemapMarkdownResponse();
  }
  return markdownPageResponse(pathFromMdSegments(path));
}
