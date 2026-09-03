# 0002. Sanity Agent Actions transform and write Markdown Pages

Date: 2026-09-03
Status: Accepted (branch `agent-actions-converter`; `main` keeps the deterministic converter)

## Context

On `main`, the Ingest Run converts a Source Page's HTML to markdown with a deterministic library (turndown) and writes the Markdown Page with plain Sanity mutations. The question was whether Sanity's own AI surfaces could take over the transformation and the writing.

Three surfaces were considered:

1. **Content Agent (Dashboard/Slack).** Conversational; every change needs human approval, never publishes, never deletes. Unsuitable for an automated run.
2. **Content Agent API.** The same agent as an AI SDK provider. Drafts only, a 10,000-character prompt limit that a single page's HTML can exceed, thread-based, billed per tool call.
3. **Agent Actions.** Schema-aware one-shot operations callable from code: `generate` (LLM writes into targeted fields) and `patch` (deterministic field writes). Support `forcePublishedWrite` and `initialValues`.

## Decision

Agent Actions are the sole transformer and writer of Markdown Pages on this branch:

- **Metadata** (title, description, path, sourceUrl, sourceHash, ingestedAt) is written deterministically: `initialValues` on `generate` for new documents, the `patch` action for existing ones. No model touches these values.
- **Markdown** is produced by `generate` with the extracted HTML and the exact frontmatter block passed as `instructionParams` constants, `target.path = "markdown"` so the model can write nothing else, and `temperature: 0`.
- **Frontmatter guard.** Because frontmatter carries the canonical URL and Source Hash, the run checks the returned markdown starts with the expected block and, if not, restores it with a `patch` action. The summary reports these pages as `repaired`.
- **Deletion** of Markdown Pages whose path left the Sitemap still uses a plain mutation; Agent Actions have no delete operation.
- The `markdown` field is no longer `readOnly` in the schema, since Agent Actions refuse to write to fields or documents marked `readOnly: true`.

## Consequences

- Every changed page costs one LLM call in AI credits and several seconds of latency. The 60-second webhook budget covers a handful of pages; larger sites need `async: true` or `after()`.
- Output is no longer byte-for-byte reproducible. "Unchanged" still means "same Source Hash," which is computed on the input HTML, so the skip logic is unaffected.
- The model can paraphrase or drop content despite the instruction; the Markdown Page is no longer a guaranteed faithful transcription. This is the trade for cleaner output on messy HTML and the option to add editorial transformations later.
- Requires the experimental `vX` API version and a deployed schema id (`SANITY_SCHEMA_ID`).
