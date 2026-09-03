import { randomUUID } from "node:crypto";
import { agentClient } from "@/lib/sanity/client";

/**
 * Sanity Agent Actions is the sole transformer and writer of Markdown Pages on
 * this branch. Two actions are used:
 *
 * - `patch`: deterministic, no LLM. Writes the exact metadata fields (title,
 *   description, path, sourceUrl, sourceHash, ingestedAt).
 * - `generate`: schema-aware LLM instruction that converts the extracted HTML
 *   into the `markdown` field. `target.path` limits the model to that field.
 *
 * `forcePublishedWrite: true` makes both write to the published document id
 * instead of a draft, which matches the auto-publish decision.
 */
export const SCHEMA_ID = process.env.SANITY_SCHEMA_ID ?? "_.schemas.default";

/**
 * Metadata fields are `readOnly: () => true` in the schema (locked in the
 * Studio). Agent Actions skip conditional read-only fields unless the request
 * opts back in, which is what this does.
 */
const CONDITIONAL_PATHS = { defaultReadOnly: false, defaultHidden: false } as const;

export type MarkdownPageMetadata = {
  title: string;
  description: string;
  path: string;
  sourceUrl: string;
  sourceHash: string;
  ingestedAt: string;
};

export type Frontmatter = {
  title: string;
  description: string;
  canonical_url: string;
  md_url: string;
  last_updated: string;
  source_hash: string;
};

/** YAML frontmatter block; values are JSON-encoded, which is valid YAML. */
export function renderFrontmatter(frontmatter: Frontmatter): string {
  const lines = (Object.keys(frontmatter) as (keyof Frontmatter)[]).map(
    (key) => `${key}: ${JSON.stringify(frontmatter[key])}`,
  );
  return `---\n${lines.join("\n")}\n---`;
}

const CONVERT_INSTRUCTION = `
You convert one HTML page into GitHub-flavoured Markdown for the "markdown" field.

Rules:
- Output must begin with this frontmatter block, copied character for character, followed by one blank line:
$frontmatter
- Then convert $html to Markdown. Preserve every heading (ATX style, "#"), paragraph, list, link (absolute URLs as given), table (pipe table), code block (fenced) and emphasis.
- Do not add, remove, summarise or paraphrase any content. Do not add commentary, a title that is not in the HTML, or trailing notes.
- Do not wrap the whole output in a code fence.
`.trim();

type ConvertInput = {
  metadata: MarkdownPageMetadata;
  frontmatter: Frontmatter;
  contentHtml: string;
};

export type ConvertResult = {
  _id: string;
  /** True when the model dropped the frontmatter and a deterministic patch restored it. */
  repaired: boolean;
};

/** Creates a new published Markdown Page: metadata via initialValues, markdown via generate. */
export async function createMarkdownPage(input: ConvertInput): Promise<ConvertResult> {
  const _id = randomUUID();
  const doc = await agentClient.agent.action.generate<
    MarkdownPageMetadata & { markdown?: string }
  >({
    schemaId: SCHEMA_ID,
    forcePublishedWrite: true,
    conditionalPaths: CONDITIONAL_PATHS,
    targetDocument: {
      operation: "create",
      _type: "markdownPage",
      _id,
      initialValues: input.metadata,
    },
    target: { path: "markdown" },
    temperature: 0,
    instruction: CONVERT_INSTRUCTION,
    instructionParams: {
      frontmatter: { type: "constant", value: renderFrontmatter(input.frontmatter) },
      html: { type: "constant", value: input.contentHtml },
    },
  });
  const repaired = await ensureFrontmatter(doc._id, doc.markdown, input.frontmatter);
  return { _id: doc._id, repaired };
}

/** Updates an existing published Markdown Page: metadata via patch, markdown via generate. */
export async function updateMarkdownPage(
  documentId: string,
  input: ConvertInput,
): Promise<ConvertResult> {
  await agentClient.agent.action.patch({
    schemaId: SCHEMA_ID,
    documentId,
    forcePublishedWrite: true,
    conditionalPaths: CONDITIONAL_PATHS,
    target: (Object.keys(input.metadata) as (keyof MarkdownPageMetadata)[]).map((key) => ({
      operation: "set" as const,
      path: key,
      value: input.metadata[key],
    })),
  });

  const doc = await agentClient.agent.action.generate<{ markdown?: string }>({
    schemaId: SCHEMA_ID,
    documentId,
    forcePublishedWrite: true,
    conditionalPaths: CONDITIONAL_PATHS,
    target: { path: "markdown" },
    temperature: 0,
    instruction: CONVERT_INSTRUCTION,
    instructionParams: {
      frontmatter: { type: "constant", value: renderFrontmatter(input.frontmatter) },
      html: { type: "constant", value: input.contentHtml },
    },
  });
  const repaired = await ensureFrontmatter(doc._id, doc.markdown, input.frontmatter);
  return { _id: doc._id, repaired };
}

/**
 * The model is asked to copy the frontmatter verbatim, but frontmatter carries
 * the canonical URL and hash, so it must be exact. If it is missing or altered,
 * restore it deterministically with a patch action and keep the model's body.
 */
async function ensureFrontmatter(
  documentId: string,
  markdown: string | undefined,
  frontmatter: Frontmatter,
): Promise<boolean> {
  const expected = renderFrontmatter(frontmatter);
  const current = (markdown ?? "").trimStart();
  if (current.startsWith(expected)) return false;

  const body = current.startsWith("---")
    ? current.replace(/^---[\s\S]*?\n---\s*/, "")
    : current;
  await agentClient.agent.action.patch({
    schemaId: SCHEMA_ID,
    documentId,
    forcePublishedWrite: true,
    conditionalPaths: CONDITIONAL_PATHS,
    target: { operation: "set", path: "markdown", value: `${expected}\n\n${body.trim()}\n` },
  });
  return true;
}
