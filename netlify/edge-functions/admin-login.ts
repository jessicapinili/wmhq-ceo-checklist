// Admin password login for /admin/. The password lives only in the ADMIN_PASSWORD
// environment variable on Netlify (never in this repo). Success gives the same 90-day session.
import { cleanName, env, normalizeEmail, SESSION_TTL_MS, sessionCookie, signToken } from "../lib/auth.ts";
import { isAdmin } from "../lib/members.ts";

const encoder = new TextEncoder();

// Compare via SHA-256 digests so the check takes the same time whatever was typed.
async function samePassword(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest("SHA-256", encoder.encode(s))));
  const ax = new Uint8Array(x), ay = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < ax.length; i++) diff |= ax[i] ^ ay[i];
  return diff === 0;
}

export default async (req: Request) => {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ ok: false, error: "Expected JSON." }, { status: 415 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  // Trim both sides: a space or line break pasted into Netlify's settings is invisible but breaks the match.
  const password = typeof body.password === "string" ? body.password.trim() : "";
  // ADMIN_KEY is accepted too, since that is the name used in this site's Netlify settings.
  const expected = (Netlify.env.get("ADMIN_PASSWORD") ?? Netlify.env.get("ADMIN_KEY") ?? "").trim();

  // Small fixed delay slows down password guessing.
  await new Promise((r) => setTimeout(r, 600));

  if (!expected) {
    return Response.json({ ok: false, error: "The admin password isn’t set up on the server yet. Add ADMIN_PASSWORD (or ADMIN_KEY) in Netlify, then redeploy." }, { status: 503 });
  }

  const ok = !!email && isAdmin(email) && (await samePassword(password, expected));
  if (!ok) return Response.json({ ok: false, error: "That email and password don't match." }, { status: 401 });

  const now = Date.now();
  const session = await signToken("session", { e: email, fn: cleanName(env("ADMIN_FIRST_NAME", "Jess")), ln: "", iat: now, chk: now });
  return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(session, SESSION_TTL_MS), "Cache-Control": "no-store" } });
};

export const config = { path: "/api/admin-login", method: "POST" };
