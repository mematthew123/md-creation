import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "_",
});
turndown.use(gfm);
turndown.remove(["script", "style", "noscript"]);

export type Frontmatter = {
  title: string;
  description: string;
  canonical_url: string;
  md_url: string;
  last_updated: string;
  source_hash: string;
};

/** Converts extracted content HTML to GitHub-flavoured markdown. */
export function htmlToMarkdown(contentHtml: string): string {
  return turndown.turndown(contentHtml).trim();
}

/**
 * Renders the final Markdown Page body: YAML frontmatter followed by the
 * converted content. Values are JSON-encoded, which is valid YAML and keeps
 * colons and quotes in titles from breaking the document.
 */
export function renderMarkdown(frontmatter: Frontmatter, body: string): string {
  const lines = (Object.keys(frontmatter) as (keyof Frontmatter)[]).map(
    (key) => `${key}: ${JSON.stringify(frontmatter[key])}`,
  );
  return `---\n${lines.join("\n")}\n---\n\n${body}\n`;
}
