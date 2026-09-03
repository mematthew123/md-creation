import { readClient } from "@/lib/sanity/client";
import {
  MARKDOWN_PAGE_BY_PATH,
  MARKDOWN_PAGE_LIST,
  type MarkdownPageDoc,
  type MarkdownPageListItem,
} from "@/lib/sanity/queries";
import { mdUrlFor, siteUrl } from "@/lib/site";

export function markdownResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control": "no-store",
    },
  });
}

export async function markdownPageResponse(path: string): Promise<Response> {
  const doc = await readClient.fetch<Pick<MarkdownPageDoc, "markdown"> | null>(
    MARKDOWN_PAGE_BY_PATH,
    { path },
  );
  if (!doc) {
    return markdownResponse(
      `# Not found\n\nNo markdown has been published for \`${path}\`.\n\nSee the index at ${siteUrl()}/sitemap.md\n`,
      404,
    );
  }
  return markdownResponse(doc.markdown);
}

export async function sitemapMarkdownResponse(): Promise<Response> {
  const site = siteUrl();
  const pages = await readClient.fetch<MarkdownPageListItem[]>(MARKDOWN_PAGE_LIST);
  const lines = pages.map((page) => {
    const label = page.title || page.path;
    const desc = page.description ? ` — ${page.description}` : "";
    return `- [${label}](${site}${mdUrlFor(page.path)})${desc}`;
  });
  const body = [
    "# Sitemap",
    "",
    `Markdown versions of every page on ${site}. Append \`.md\` to any page URL, or request the page with \`Accept: text/markdown\`.`,
    "",
    ...(lines.length ? lines : ["_No pages have been ingested yet._"]),
    "",
  ].join("\n");
  return markdownResponse(body);
}
