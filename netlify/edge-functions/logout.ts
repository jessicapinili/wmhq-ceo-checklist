// Clears the session cookie and sends her back to the login page.
import { clearedSessionCookie } from "../lib/auth.ts";

export default (req: Request) =>
  new Response(null, {
    status: 302,
    headers: { Location: new URL("/login/", req.url).toString(), "Set-Cookie": clearedSessionCookie(), "Cache-Control": "no-store" },
  });

export const config = { path: "/api/logout" };
