// Protects the whole checklist app and the admin page. Only /login/ and /api/* are open.
import { clearedSessionCookie, getSession, RECHECK_MS, SESSION_TTL_MS, sessionCookie, signToken } from "../lib/auth.ts";
import { hasAccess, isAdmin } from "../lib/members.ts";

function toLogin(req: Request, clearCookie = false): Response {
  // Admin pages use the email + password login; everything else uses the emailed link.
  const page = new URL(req.url).pathname.startsWith("/admin") ? "/admin/login/" : "/login/";
  const headers = new Headers({ Location: new URL(page, req.url).toString(), "Cache-Control": "no-store" });
  if (clearCookie) headers.append("Set-Cookie", clearedSessionCookie());
  return new Response(null, { status: 302, headers });
}

export default async (req: Request, context: { next: () => Promise<Response> }) => {
  const session = await getSession(req);
  if (!session) return toLogin(req, true);

  if (new URL(req.url).pathname.startsWith("/admin") && !isAdmin(session.e)) return toLogin(req);

  const now = Date.now();
  let refreshedCookie: string | null = null;
  if (now - session.chk > RECHECK_MS) {
    try {
      if (!(await hasAccess(session.e))) return toLogin(req, true);
      const token = await signToken("session", { ...session, chk: now });
      refreshedCookie = sessionCookie(token, SESSION_TTL_MS - (now - session.iat));
    } catch (err) {
      // Member list unreachable: keep the member in rather than locking everyone out. Retry next visit.
      console.error("Daily access re-check failed:", err);
    }
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store");
  if (refreshedCookie) headers.append("Set-Cookie", refreshedCookie);
  return new Response(response.body, { status: response.status, headers });
};

export const config = {
  path: "/*",
  excludedPath: ["/login", "/login/", "/login/*", "/admin/login", "/admin/login/", "/admin/login/*", "/api/*", "/favicon.png"],
};
