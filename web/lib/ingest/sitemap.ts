/** Returns site paths from sitemap.xml; only the pathname is kept, never the advertised host. */
export async function fetchSitemapPaths(site: string): Promise<string[]> {
  const res = await fetch(`${site}/sitemap.xml`, {
    cache: "no-store",
    headers: { Accept: "application/xml,text/xml", "User-Agent": INGEST_USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`sitemap.xml returned ${res.status}`);
  }
  const xml = await res.text();
  const paths = new Set<string>();
  for (const match of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    const path = normalizePath(match[1]);
    if (path && isIngestable(path)) paths.add(path);
  }
  return [...paths];
}

export const INGEST_USER_AGENT = "md-creation-ingest/0.1";

function normalizePath(loc: string): string | null {
  try {
    const url = new URL(loc.trim());
    const pathname = url.pathname.replace(/\/+$/, "");
    return pathname === "" ? "/" : pathname;
  } catch {
    return null;
  }
}

/** Never ingest our own markdown output or API/asset routes. */
function isIngestable(path: string): boolean {
  if (/\.md$/i.test(path)) return false;
  if (path.startsWith("/api/") || path.startsWith("/_next/") || path.startsWith("/md/")) return false;
  return true;
}
