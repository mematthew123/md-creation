# 0001. Store Markdown Pages in Sanity

Date: 2026-09-02
Status: Accepted

## Context

Every Source Page needs a Markdown Page that agents can fetch at a Markdown URL or through Content Negotiation. The Markdown Page has to be produced by an Ingest Run, be discoverable for a Markdown Sitemap, be removable when its Source Page disappears, and be skippable when the Source Page is unchanged.

Three places to keep it were considered:

1. **Vercel Blob.** A `<path>.md` object per page. Cheap and already familiar from a sibling project, but Blob has no queryable natural key (finding "every page not in this sitemap" means listing and diffing), nothing is visible in the Studio, and there is no schema to validate what was written.
2. **Nowhere: convert on request.** The markdown handler fetches the HTML and converts it each time. Always fresh, but it couples serving to rendering, pays render plus conversion per request, cannot skip unchanged pages, and leaves no record of what agents were served.
3. **Sanity document.** A `markdownPage` document keyed by the Source Page path.

## Decision

Markdown Pages are Sanity documents in the same project as the rest of the content. The Ingest Run creates, patches and deletes them directly as published documents; the Studio shows them read-only.

## Consequences

- Queries give the Ingest Run its natural key lookup, its stale-page deletion and the Markdown Sitemap listing for free.
- Markdown Pages are visible and auditable in the Studio next to CMS content, and can later gain editorial fields (overrides, review) without changing where they live.
- Every Markdown URL read costs one Sanity round-trip. Acceptable for the proof of concept; tag-based revalidation after an Ingest Run is the planned mitigation.
- Local Ingest Runs write into the shared dataset. Use a separate dataset locally or re-run the production ingest afterwards.
