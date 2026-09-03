import { verifyBearer } from "@/lib/auth/verify";
import { runIngest } from "@/lib/ingest/run-ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Manual trigger; `?force=1` rewrites every page. */
export async function POST(request: Request) {
  if (!verifyBearer(request, process.env.INGEST_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const force = new URL(request.url).searchParams.get("force") === "1";
    const summary = await runIngest({ force });
    return Response.json(summary, { status: summary.errors.length ? 207 : 200 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
