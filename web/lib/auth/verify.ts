import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Constant-time string comparison that does not leak length. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** True when the request carries `Authorization: Bearer <secret>`. */
export function verifyBearer(request: Request, secret: string | undefined): boolean {
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return false;
  return safeEqual(match[1].trim(), secret);
}

/**
 * Vercel signs webhook bodies with HMAC-SHA1 of the raw body using the
 * webhook secret and sends the hex digest in `x-vercel-signature`.
 */
export function verifyVercelSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined,
): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac("sha1", secret).update(rawBody).digest("hex");
  return safeEqual(signature, expected);
}
