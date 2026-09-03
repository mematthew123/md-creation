# md-creation — domain glossary

The shared language for this project. Definitions only; no implementation details.

| Term | Definition |
| --- | --- |
| **Source Page** | An HTML page of the site that humans see. Source Pages are not authored in the CMS. |
| **Sitemap** | The site's declared list of Source Pages. It is the source of truth for which pages exist. |
| **Ingest Run** | One pass that reads the Sitemap and refreshes every Markdown Page: new Source Pages get one, changed ones are rewritten, unchanged ones are left alone, and removed ones lose theirs. |
| **Markdown Page** | The stored markdown representation of exactly one Source Page. It is machine-owned; people read it but do not edit it. |
| **Publish** | Making a Markdown Page publicly readable at its Markdown URL. An Ingest Run publishes directly; there is no review step. |
| **Source Hash** | A fingerprint of a Source Page's content. Two Ingest Runs that see the same Source Hash for a page treat it as unchanged. |
| **Markdown URL** | The explicit, shareable address at which a Markdown Page is served: the Source Page's address with `.md` appended (the home page is `/index.md`). |
| **Content Negotiation** | Serving either the Source Page or its Markdown Page from the same address, depending on which format the client asks for. |
| **Markdown Sitemap** | An index of every published Markdown Page, itself served as markdown, so agents can discover pages without guessing addresses. |
| **Agent Context** | A published configuration that lets agents read Markdown Pages directly through a query interface instead of fetching Markdown URLs. Its instructions always carry the current index of Markdown Pages, refreshed by every Ingest Run. |
