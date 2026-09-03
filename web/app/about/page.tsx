import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What md-creation is and why it exists.",
  alternates: {
    canonical: "/about",
    types: { "text/markdown": "/about.md" },
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p>
        md-creation explores one question: when a page is not authored in a
        CMS, how does it still get an agent-friendly markdown twin without
        anyone writing it by hand?
      </p>
      <h2 className="text-xl font-semibold">Why markdown</h2>
      <p>
        HTML is expensive for language models to read. A heading like{" "}
        <code>## About</code> costs a handful of tokens in markdown and several
        times that once wrapped in markup, classes and scripts. Serving
        markdown for the same URL keeps humans and agents on one canonical
        address.
      </p>
      <h2 className="text-xl font-semibold">Vocabulary</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Source Page</strong>: an HTML page of this site that humans see.
        </li>
        <li>
          <strong>Ingest Run</strong>: one pass that reads the sitemap and refreshes every Markdown Page.
        </li>
        <li>
          <strong>Markdown Page</strong>: the stored markdown representation of one Source Page.
        </li>
      </ul>
      <p>
        Read the <a href="/pricing" className="underline">pricing page</a> to see a table survive the conversion.
      </p>
    </main>
  );
}
