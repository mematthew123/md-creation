/**
 * Static registry of the site's Source Pages. These are the pages that are
 * NOT authored in Sanity; the ingest run reads them from sitemap.xml, which is
 * generated from this list.
 */
export type SitePage = {
  /** Site path of the HTML page, e.g. "/about". */
  path: string;
  /** Explicit Markdown URL path, e.g. "/about.md". */
  mdPath: string;
};

export const SITE_PAGES: SitePage[] = [
  { path: "/", mdPath: "/index.md" },
  { path: "/about", mdPath: "/about.md" },
  { path: "/pricing", mdPath: "/pricing.md" },
];

/** Canonical site origin without a trailing slash. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** Markdown URL path for a site path: "/" -> "/index.md", "/about" -> "/about.md". */
export function mdUrlFor(path: string): string {
  return path === "/" ? "/index.md" : `${path}.md`;
}

/**
 * Site path for the segments captured by the /md/[[...path]] handler.
 * undefined, [] or ["index"] -> "/"; ["about"] or ["about.md"] -> "/about".
 */
export function pathFromMdSegments(segments?: string[]): string {
  if (!segments || segments.length === 0) return "/";
  const parts = [...segments];
  const last = parts[parts.length - 1].replace(/\.md$/i, "");
  parts[parts.length - 1] = last;
  if (parts.length === 1 && (last === "" || last === "index")) return "/";
  return `/${parts.filter(Boolean).join("/")}`;
}
