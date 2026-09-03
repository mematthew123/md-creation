export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto w-full max-w-3xl px-6 py-4 text-xs text-zinc-500">
        Every page is also available as markdown: append <code>.md</code> to the
        URL or request it with <code>Accept: text/markdown</code>. Index at{" "}
        <a href="/sitemap.md" className="underline">
          /sitemap.md
        </a>
        .
      </div>
    </footer>
  );
}
