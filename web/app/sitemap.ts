import type { MetadataRoute } from "next";
import { SITE_PAGES, siteUrl } from "@/lib/site";

/**
 * Lists only HTML Source Pages. Never add Markdown URLs here: the ingest run
 * reads this sitemap, and listing .md URLs would make it ingest its own output.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl();
  return SITE_PAGES.map((page) => ({
    url: `${site}${page.path}`,
    lastModified: new Date(),
  }));
}
