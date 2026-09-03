import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Plans for the md-creation proof of concept.",
  alternates: {
    canonical: "/pricing",
    types: { "text/markdown": "/pricing.md" },
  },
};

const PLANS = [
  { name: "Hobby", price: "$0", pages: "3 pages", trigger: "Manual" },
  { name: "Pro", price: "$20", pages: "500 pages", trigger: "Deploy webhook" },
  { name: "Enterprise", price: "Custom", pages: "Unlimited", trigger: "Deploy webhook + cron" },
];

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
      <p>Illustrative plans. Nothing here is for sale; the table exists to exercise GFM conversion.</p>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-300 dark:border-zinc-700">
            <th className="py-2 pr-4">Plan</th>
            <th className="py-2 pr-4">Price / month</th>
            <th className="py-2 pr-4">Pages</th>
            <th className="py-2">Trigger</th>
          </tr>
        </thead>
        <tbody>
          {PLANS.map((plan) => (
            <tr key={plan.name} className="border-b border-zinc-200 dark:border-zinc-800">
              <td className="py-2 pr-4 font-medium">{plan.name}</td>
              <td className="py-2 pr-4">{plan.price}</td>
              <td className="py-2 pr-4">{plan.pages}</td>
              <td className="py-2">{plan.trigger}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-xl font-semibold">FAQ</h2>
      <p>
        <strong>Does the markdown update when the page changes?</strong> Yes. Each
        ingest run hashes the page content and only rewrites pages whose hash
        changed.
      </p>
    </main>
  );
}
