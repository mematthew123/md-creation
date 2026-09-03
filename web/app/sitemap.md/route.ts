import { sitemapMarkdownResponse } from "@/lib/markdown/serve";

export const dynamic = "force-dynamic";

export async function GET() {
  return sitemapMarkdownResponse();
}
