import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the md-creation project.",
  alternates: {
    canonical: "/contact",
    types: { "text/markdown": "/contact.md" },
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p>
        Questions about the project or the markdown-for-agents approach? Send a
        message and we&apos;ll get back to you.
      </p>
      <ContactForm />
    </main>
  );
}
