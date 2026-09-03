import { verifyVercelSignature } from "@/lib/auth/verify";
import { runIngest } from "@/lib/ingest/run-ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type VercelWebhook = {
  type?: string;
  payload?: {
    target?: string | null;
    project?: { id?: string };
    deployment?: { url?: string };
  };
};

/**
 * Vercel account webhook. Runs an Ingest Run after a production deployment of
 * this project is live. `deployment.promoted` fires once the production alias
 * points at the new deployment; `deployment.succeeded` with target=production
 * is accepted too, and the hash check makes a duplicate run a no-op.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-vercel-signature");
  if (!verifyVercelSignature(rawBody, signature, process.env.VERCEL_WEBHOOK_SECRET)) {
    return Response.json({ error: "invalid signature" }, { status: 403 });
  }

  let event: VercelWebhook;
  try {
    event = JSON.parse(rawBody) as VercelWebhook;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const type = event.type ?? "";
  const payload = event.payload ?? {};
  const isProductionEvent =
    type === "deployment.promoted" ||
    (type === "deployment.succeeded" && payload.target === "production");

  if (!isProductionEvent) {
    return Response.json({ ignored: true, reason: `event ${type || "unknown"}` });
  }
  if (!process.env.VERCEL_PROJECT_ID || payload.project?.id !== process.env.VERCEL_PROJECT_ID) {
    return Response.json({ ignored: true, reason: "project mismatch" });
  }

  try {
    const summary = await runIngest();
    return Response.json({ event: type, ...summary }, { status: summary.errors.length ? 207 : 200 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
