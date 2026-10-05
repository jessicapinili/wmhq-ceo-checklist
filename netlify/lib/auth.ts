// Shared helpers for the checklist login: signed tokens, cookies, email normalising.
// Same pattern as the WMHQ Tools dashboard. Runs in Netlify Edge Functions (Deno), web-standard APIs only.

export const SESSION_COOKIE = "wmhq_ceo_session";
export const LINK_TTL_MS = 15 * 60 * 1000; // login link: 15 minutes
export const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // session: 90 days
export const RECHECK_MS = 24 * 60 * 60 * 1000; // re-confirm access once a day

export function env(name: string, fallback?: string): string {
  const value = Netlify.env.get(name) ?? fallback;
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

// ---------- signing ----------

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(env("SESSION_SECRET")), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

// Token format: base64url(json payload) "." base64url(hmac). `purpose` stops a
// login-link token from being used as a session cookie and vice versa.
export async function signToken(purpose: string, payload: Record<string, unknown>): Promise<string> {
  const json = JSON.stringify({ ...payload, p: purpose });
  const body = toBase64Url(encoder.encode(json));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyToken<T>(purpose: string, token: string | undefined | null): Promise<T | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(), fromBase64Url(sig), encoder.encode(body));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    return payload.p === purpose ? (payload as T) : null;
  } catch {
    return null;
  }
}

// ---------- cookies ----------

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export function sessionCookie(value: string, maxAgeMs: number): string {
  return `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${Math.floor(maxAgeMs / 1000)}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearedSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

// ---------- members ----------

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : null;
}

export function cleanName(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().replace(/\s+/g, " ").slice(0, 60) : "";
}

// ---------- sessions ----------

/** e = email, fn/ln = first/last name entered at login, iat = issued, chk = last access check. */
export type Session = { e: string; fn: string; ln: string; iat: number; chk: number };

// The signed-in session from the request cookie, or null if missing, tampered or older than 90 days.
export async function getSession(req: Request): Promise<Session | null> {
  const session = await verifyToken<Session>("session", readCookie(req, SESSION_COOKIE));
  return session && Date.now() - session.iat <= SESSION_TTL_MS ? session : null;
}
