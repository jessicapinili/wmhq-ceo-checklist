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
  const password = typeof body.password === "string" ? body.password : "";
  const expected = Netlify.env.get("ADMIN_PASSWORD") ?? "";

  // Small fixed delay slows down password guessing.
  await new Promise((r) => setTimeout(r, 600));

  const ok = !!email && !!expected && isAdmin(email) && (await samePassword(password, expected));
  if (!ok) return Response.json({ ok: false, error: "That email and password don't match." }, { status: 401 });

  const now = Date.now();
  const session = await signToken("session", { e: email, fn: cleanName(env("ADMIN_FIRST_NAME", "Jess")), ln: "", iat: now, chk: now });
  return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(session, SESSION_TTL_MS), "Cache-Control": "no-store" } });
};

export const config = { path: "/api/admin-login", method: "POST" };
