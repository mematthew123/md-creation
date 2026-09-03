import { writeClient } from "@/lib/sanity/client";
import { MARKDOWN_PAGE_LIST, type MarkdownPageListItem } from "@/lib/sanity/queries";
import { mdUrlFor } from "@/lib/site";

/**
 * Sanity Context: a published `sanity.agentContext` document turns the dataset
 * into a read-only MCP endpoint scoped by `groqFilter`. The ingest run keeps
 * one such document in sync so its `instructions` (returned by the
 * `/initial-context` endpoint) always carry the current index of Markdown
 * Pages, like an auto-maintained llms.txt.
 */
export const AGENT_CONTEXT_TYPE = "sanity.agentContext";
export const AGENT_CONTEXT_SLUG = "site-pages";
export const AGENT_CONTEXT_GROQ_FILTER = '_type == "markdownPage"';

const AGENT_CONTEXT_BY_SLUG = /* groq */ `
  *[_type == $type && slug.current == $slug][0]{ _id, instructions }
`;

export function mcpEndpointUrl(projectId: string, dataset: string): string {
  return `https://api.sanity.io/v2026-09-02/context/mcp/${projectId}/${dataset}/${AGENT_CONTEXT_SLUG}`;
}

export function buildInstructions(site: string, pages: MarkdownPageListItem[]): string {
  const index = pages.length
    ? pages.map((p) => {
        const desc = p.description ? ` — ${p.description}` : "";
        return `- ${p.path} → ${site}${mdUrlFor(p.path)}${desc}`;
      })
    : ["- (no pages ingested yet)"];

  return [
    `You have read-only access to the markdown versions of every page on ${site}.`,
    "",
    "Each `markdownPage` document is one page of the site:",
    "- `path` is the page's site path (natural key), e.g. \"/about\". The home page is \"/\".",
    "- `markdown` is the full page as GitHub-flavoured markdown with YAML frontmatter",
    "  (title, description, canonical_url, md_url, last_updated, source_hash).",
    "- `title` and `description` are the page's HTML metadata; `ingestedAt` is when it was last refreshed.",
    "",
    "To answer a question about a page, query by path and read `markdown`:",
    '  *[_type == "markdownPage" && path == $path][0].markdown',
    "To find pages by topic, filter on title/description or search `markdown`.",
    "Never invent pages: if a path is not listed below, it does not exist.",
    "",
    `Pages currently published (${pages.length}):`,
    ...index,
    "",
    `Index as markdown: ${site}/sitemap.md`,
  ].join("\n");
}

/** Creates or updates the Context document. Returns the document id. */
export async function syncAgentContext(site: string): Promise<string> {
  const pages = await writeClient.fetch<MarkdownPageListItem[]>(MARKDOWN_PAGE_LIST);
  const instructions = buildInstructions(site, pages);

  const existing = await writeClient.fetch<{ _id: string; instructions?: string } | null>(
    AGENT_CONTEXT_BY_SLUG,
    { type: AGENT_CONTEXT_TYPE, slug: AGENT_CONTEXT_SLUG },
  );

  if (existing) {
    if (existing.instructions !== instructions) {
      await writeClient.patch(existing._id).set({ instructions }).commit();
    }
    return existing._id;
  }

  const created = await writeClient.create({
    _type: AGENT_CONTEXT_TYPE,
    version: "1",
    name: "Site pages (markdown)",
    slug: { _type: "slug", current: AGENT_CONTEXT_SLUG },
    groqFilter: AGENT_CONTEXT_GROQ_FILTER,
    instructions,
  });
  return created._id;
}
