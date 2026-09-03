import type { MetadataRoute } from "next";
import { SITE_PAGES, siteUrl } from "@/lib/site";

/** HTML pages only; the ingest reads this, so never list .md URLs. */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl();
  return SITE_PAGES.map((page) => ({
    url: `${site}${page.path}`,
    lastModified: new Date(),
  }));
}
