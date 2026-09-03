import { createHash } from "node:crypto";
import * as cheerio from "cheerio";

export type ExtractedPage = {
  title: string;
  description: string;
  /** HTML of the page's main content with framework noise removed and links absolutized. */
  contentHtml: string;
  /** sha256 over title, description and whitespace-normalized contentHtml. */
  sourceHash: string;
};

/**
 * Pulls the human-readable content out of a rendered Source Page and
 * fingerprints it. Framework noise (scripts, styles, React comment markers,
 * chrome like nav/header/footer) is removed first so the hash only changes
 * when the content changes.
 */
export function extractPage(html: string, site: string): ExtractedPage {
  const $ = cheerio.load(html);

  const title =
    $("title").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";

  const root = $("main").first().length ? $("main").first() : $("body");
  root.find("script, style, noscript, template, nav, header, footer, [aria-hidden='true']").remove();
  root.find("*").contents().filter((_, node) => node.type === "comment").remove();
  root.contents().filter((_, node) => node.type === "comment").remove();

  root.find("a[href^='/']").each((_, el) => {
    const href = $(el).attr("href");
    if (href) $(el).attr("href", `${site}${href}`);
  });
  root.find("img[src^='/']").each((_, el) => {
    const src = $(el).attr("src");
    if (src) $(el).attr("src", `${site}${src}`);
  });

  // Keep the real HTML for conversion (newlines inside <pre> matter), but hash
  // a whitespace-collapsed copy so formatting churn does not look like a change.
  const contentHtml = (root.html() ?? "").trim();
  const normalized = contentHtml.replace(/\s+/g, " ");
  const sourceHash = createHash("sha256")
    .update(`${title}\n${description}\n${normalized}`)
    .digest("hex");

  return { title, description, contentHtml, sourceHash };
}
