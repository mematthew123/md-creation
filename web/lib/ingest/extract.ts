import { createHash } from "node:crypto";
import * as cheerio from "cheerio";

export type ExtractedPage = {
  title: string;
  description: string;
  contentHtml: string;
  sourceHash: string;
};

/** Extracts the page's main content and fingerprints it. */
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

  // Hash a whitespace-collapsed copy so formatting churn is not a change; keep the real HTML for <pre>.
  const contentHtml = (root.html() ?? "").trim();
  const normalized = contentHtml.replace(/\s+/g, " ");
  const sourceHash = createHash("sha256")
    .update(`${title}\n${description}\n${normalized}`)
    .digest("hex");

  return { title, description, contentHtml, sourceHash };
}
