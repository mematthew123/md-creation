import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "md-creation",
  description:
    "Pages outside the CMS, ingested from the sitemap and published as markdown for agents.",
  alternates: {
    canonical: "/",
    types: { "text/markdown": "/index.md" },
  },
};

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Markdown for agents</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        This site is a proof of concept. Its pages are ordinary Next.js routes,
        not CMS documents. An ingest run reads the sitemap, fetches each page,
        converts the main content to markdown and publishes it so agents can
        read the same content at a fraction of the token cost.
      </p>
      <h2 className="text-xl font-semibold">How it works</h2>
      <ol className="list-decimal space-y-2 pl-6">
        <li>A deploy finishes and Vercel calls the ingest webhook.</li>
        <li>The ingest run reads <code>/sitemap.xml</code> and fetches every page as HTML.</li>
        <li>The main content is converted to markdown and stored as a Markdown Page.</li>
        <li>
          Agents request <code>/about.md</code> or send <code>Accept: text/markdown</code>.
        </li>
      </ol>
      <h2 className="text-xl font-semibold">Try it</h2>
      <pre className="overflow-x-auto rounded bg-zinc-100 p-4 text-sm dark:bg-zinc-900">
        <code>{`curl -H "Accept: text/markdown" ${"https://example.com"}/about\ncurl https://example.com/about.md`}</code>
      </pre>
    </main>
  );
}
