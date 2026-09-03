import { writeClient } from "@/lib/sanity/client";
import { MARKDOWN_PAGE_BY_PATH, MARKDOWN_PAGE_STALE_IDS, type MarkdownPageDoc } from "@/lib/sanity/queries";
import { mdUrlFor, siteUrl } from "@/lib/site";
import { syncAgentContext } from "./agent-context";
import { extractPage } from "./extract";
import { fetchSitemapPaths, INGEST_USER_AGENT } from "./sitemap";
import { htmlToMarkdown, renderMarkdown } from "./to-markdown";

export type IngestSummary = {
  site: string;
  startedAt: string;
  finishedAt: string;
  created: string[];
  updated: string[];
  skipped: string[];
  deleted: string[];
  /** Id of the Sanity Context document kept in sync with the page index. */
  agentContextId?: string;
  errors: { path: string; message: string }[];
};

/**
 * One Ingest Run: read the sitemap, refresh every Markdown Page whose Source
 * Page changed, and delete Markdown Pages whose Source Page left the sitemap.
 * Writes go straight to published documents (no drafts).
 */
export async function runIngest(): Promise<IngestSummary> {
  const site = siteUrl();
  const summary: IngestSummary = {
    site,
    startedAt: new Date().toISOString(),
    finishedAt: "",
    created: [],
    updated: [],
    skipped: [],
    deleted: [],
    errors: [],
  };

  const paths = await fetchSitemapPaths(site);

  for (const path of paths) {
    try {
      await ingestPath(site, path, summary);
    } catch (err) {
      summary.errors.push({ path, message: err instanceof Error ? err.message : String(err) });
    }
  }

  // The sitemap is the source of truth: anything not in it is gone.
  const staleIds = await writeClient.fetch<string[]>(MARKDOWN_PAGE_STALE_IDS, { paths });
  if (staleIds.length > 0) {
    const tx = writeClient.transaction();
    for (const id of staleIds) tx.delete(id);
    await tx.commit();
    summary.deleted.push(...staleIds);
  }

  // Keep the Sanity Context document's instructions in step with the page index.
  try {
    summary.agentContextId = await syncAgentContext(site);
  } catch (err) {
    summary.errors.push({
      path: "(agent context)",
      message: err instanceof Error ? err.message : String(err),
    });
  }

  summary.finishedAt = new Date().toISOString();
  return summary;
}

async function ingestPath(site: string, path: string, summary: IngestSummary): Promise<void> {
  const sourceUrl = `${site}${path}`;
  // Ask for HTML explicitly so the Accept-header rewrite can never hand the
  // ingest run its own markdown output.
  const res = await fetch(sourceUrl, {
    cache: "no-store",
    headers: { Accept: "text/html", "User-Agent": INGEST_USER_AGENT },
  });
  if (!res.ok) throw new Error(`fetch returned ${res.status}`);

  const html = await res.text();
  const extracted = extractPage(html, site);

  const existing = await writeClient.fetch<MarkdownPageDoc | null>(MARKDOWN_PAGE_BY_PATH, { path });
  if (existing && existing.sourceHash === extracted.sourceHash) {
    summary.skipped.push(path);
    return;
  }

  const ingestedAt = new Date().toISOString();
  const markdown = renderMarkdown(
    {
      title: extracted.title,
      description: extracted.description,
      canonical_url: sourceUrl,
      md_url: `${site}${mdUrlFor(path)}`,
      last_updated: ingestedAt,
      source_hash: extracted.sourceHash,
    },
    htmlToMarkdown(extracted.contentHtml),
  );

  const fields = {
    title: extracted.title,
    description: extracted.description,
    path,
    sourceUrl,
    markdown,
    sourceHash: extracted.sourceHash,
    ingestedAt,
  };

  if (existing) {
    await writeClient.patch(existing._id).set(fields).commit();
    summary.updated.push(path);
  } else {
    await writeClient.create({ _type: "markdownPage", ...fields });
    summary.created.push(path);
  }
}
