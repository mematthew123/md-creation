import { randomUUID } from "node:crypto";
import { agentClient } from "@/lib/sanity/client";

// Agent Actions write Markdown Pages: `patch` sets metadata deterministically,
// `generate` writes the `markdown` field. forcePublishedWrite skips drafts.
export const SCHEMA_ID = process.env.SANITY_SCHEMA_ID ?? "_.schemas.default";

// Metadata fields are `readOnly: () => true` in the schema; opt back in per request.
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

/** JSON-encoded values are valid YAML scalars. */
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
  repaired: boolean;
};

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

/** Frontmatter must be exact; restore it if the model altered it. */
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
