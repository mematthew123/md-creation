/** Non-CMS pages; sitemap.xml is generated from this list. */
export type SitePage = {
  path: string;
  mdPath: string;
};

export const SITE_PAGES: SitePage[] = [
  { path: "/", mdPath: "/index.md" },
  { path: "/about", mdPath: "/about.md" },
  { path: "/pricing", mdPath: "/pricing.md" },
];

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** "/" -> "/index.md", "/about" -> "/about.md" */
export function mdUrlFor(path: string): string {
  return path === "/" ? "/index.md" : `${path}.md`;
}

/** ["about.md"] -> "/about"; undefined or ["index"] -> "/" */
export function pathFromMdSegments(segments?: string[]): string {
  if (!segments || segments.length === 0) return "/";
  const parts = [...segments];
  const last = parts[parts.length - 1].replace(/\.md$/i, "");
  parts[parts.length - 1] = last;
  if (parts.length === 1 && (last === "" || last === "index")) return "/";
  return `/${parts.filter(Boolean).join("/")}`;
}
