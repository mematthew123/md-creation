import Link from "next/link";
import { SITE_PAGES } from "@/lib/site";

const LABELS: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/pricing": "Pricing",
  "/contact": "Contact",
};

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-3xl items-center gap-6 px-6 py-4 text-sm"
      >
        <span className="font-semibold">md-creation</span>
        <ul className="flex gap-4">
          {SITE_PAGES.map((page) => (
            <li key={page.path}>
              <Link href={page.path} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                {LABELS[page.path] ?? page.path}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
