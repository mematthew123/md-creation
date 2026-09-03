import { writeClient } from "@/lib/sanity/client";
import { MARKDOWN_PAGE_BY_PATH, MARKDOWN_PAGE_STALE_IDS, type MarkdownPageDoc } from "@/lib/sanity/queries";
import { mdUrlFor, siteUrl } from "@/lib/site";
import { syncAgentContext } from "./agent-context";
import { createMarkdownPage, updateMarkdownPage } from "./agent-actions";
import { extractPage } from "./extract";
import { fetchSitemapPaths, INGEST_USER_AGENT } from "./sitemap";

export type IngestSummary = {
  site: string;
  startedAt: string;
  finishedAt: string;
  created: string[];
  updated: string[];
  skipped: string[];
  deleted: string[];
  repaired: string[];
  agentContextId?: string;
  errors: { path: string; message: string }[];
};

export type IngestOptions = {
  /** Rewrite pages even when the source hash is unchanged. */
  force?: boolean;
};

/** Sitemap -> extract -> Agent Actions write; stale pages deleted. */
export async function runIngest(options: IngestOptions = {}): Promise<IngestSummary> {
  const site = siteUrl();
  const summary: IngestSummary = {
    site,
    startedAt: new Date().toISOString(),
    finishedAt: "",
    created: [],
    updated: [],
    skipped: [],
    deleted: [],
    repaired: [],
    errors: [],
  };

  const paths = await fetchSitemapPaths(site);

  for (const path of paths) {
    try {
      await ingestPath(site, path, summary, options);
    } catch (err) {
      summary.errors.push({ path, message: err instanceof Error ? err.message : String(err) });
    }
  }

  // Agent Actions cannot delete, so this stays a plain mutation.
  const staleIds = await writeClient.fetch<string[]>(MARKDOWN_PAGE_STALE_IDS, { paths });
  if (staleIds.length > 0) {
    const tx = writeClient.transaction();
    for (const id of staleIds) tx.delete(id);
    await tx.commit();
    summary.deleted.push(...staleIds);
  }

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

async function ingestPath(
  site: string,
  path: string,
  summary: IngestSummary,
  options: IngestOptions,
): Promise<void> {
  const sourceUrl = `${site}${path}`;
  // Explicit Accept so the markdown rewrite never feeds us our own output.
  const res = await fetch(sourceUrl, {
    cache: "no-store",
    headers: { Accept: "text/html", "User-Agent": INGEST_USER_AGENT },
  });
  if (!res.ok) throw new Error(`fetch returned ${res.status}`);

  const html = await res.text();
  const extracted = extractPage(html, site);

  const existing = await writeClient.fetch<MarkdownPageDoc | null>(MARKDOWN_PAGE_BY_PATH, { path });
  if (!options.force && existing && existing.sourceHash === extracted.sourceHash) {
    summary.skipped.push(path);
    return;
  }

  const ingestedAt = new Date().toISOString();
  const input = {
    metadata: {
      title: extracted.title,
      description: extracted.description,
      path,
      sourceUrl,
      sourceHash: extracted.sourceHash,
      ingestedAt,
    },
    frontmatter: {
      title: extracted.title,
      description: extracted.description,
      canonical_url: sourceUrl,
      md_url: `${site}${mdUrlFor(path)}`,
      last_updated: ingestedAt,
      source_hash: extracted.sourceHash,
    },
    contentHtml: extracted.contentHtml,
  };

  const result = existing
    ? await updateMarkdownPage(existing._id, input)
    : await createMarkdownPage(input);

  (existing ? summary.updated : summary.created).push(path);
  if (result.repaired) summary.repaired.push(path);
}
