// Tells the app who is signed in, so it can greet her and keep her progress separate per email.
import { getSession } from "../lib/auth.ts";
import { isAdmin } from "../lib/members.ts";

export default async (req: Request) => {
  const session = await getSession(req);
  if (!session) return Response.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  return Response.json(
    { ok: true, email: session.e, firstName: session.fn ?? "", lastName: session.ln ?? "", admin: isAdmin(session.e) },
    { headers: { "Cache-Control": "no-store" } },
  );
};

export const config = { path: "/api/me", method: "GET" };
