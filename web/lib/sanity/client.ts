import { createClient } from "@sanity/client";

const base = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "5ouc347b",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-09-02",
  useCdn: false,
  perspective: "published" as const,
};

export const readClient = createClient(base);

export const writeClient = createClient({
  ...base,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

/** Agent Actions require the experimental `vX` API version. */
export const agentClient = writeClient.withConfig({ apiVersion: "vX" });
