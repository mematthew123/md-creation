import { createClient } from "@sanity/client";

const base = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "5ouc347b",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-09-02",
  // Serve fresh content right after an ingest run; no CDN lag for the POC.
  useCdn: false,
  perspective: "published" as const,
};

/** Public reads. The dataset is public, so no token is required. */
export const readClient = createClient(base);

/** Server-only writes used by the ingest run. */
export const writeClient = createClient({
  ...base,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
