// Login form submits here. Emails a 15-minute link only if the email is on the member list.
// The response is identical either way so the page never reveals who is a member.
import { cleanName, env, LINK_TTL_MS, normalizeEmail, signToken } from "../lib/auth.ts";
import { hasAccess } from "../lib/members.ts";

const DEFAULT_FROM = "Woman Mastery HQ <login@womanmasteryhqportal.com>";

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function emailHtml(link: string, firstName: string): string {
  const hi = firstName ? `Hi ${escapeHtml(firstName)}, here's` : "Here's";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4dfe4;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#3a1416;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:2px solid #3a1416;border-radius:18px;overflow:hidden;">
        <tr><td style="background:#3a1416;padding:24px 32px;">
          <div style="font-size:17px;font-weight:800;color:#efe7dc;">The Next 60 by WMHQ</div>
          <div style="font-size:10px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:#ecc5ce;margin-top:6px;">Your login link</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;">Ready when you are.</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#7a5a5c;">${hi} your one-tap login link. It's valid for 15 minutes and keeps you logged in on this device for 90 days.</p>
          <a href="${link}" style="display:inline-block;background:#3a1416;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;">Open my checklist</a>
          <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#7a5a5c;">Didn't ask for this? You can ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendLoginEmail(to: string, link: string, firstName: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env("MAIL_FROM", DEFAULT_FROM),
      to: [to],
      subject: "Your login link for The Next 60",
      html: emailHtml(link, firstName),
      text: `Your one-tap login link for The Next 60 by WMHQ, valid for 15 minutes:\n\n${link}\n\nDidn't ask for this? You can ignore this email.`,
    }),
  });
  if (!res.ok) throw new Error(`Resend send failed (HTTP ${res.status}): ${await res.text()}`);
}

export default async (req: Request) => {
  // Requiring JSON stops other websites auto-posting forms here to spam members' inboxes.
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ ok: false, error: "Expected JSON." }, { status: 415 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Please fill in your details." }, { status: 400 });
  }

  const firstName = cleanName(body.firstName);
  const lastName = cleanName(body.lastName);
  const email = normalizeEmail(body.email);
  if (!firstName || !lastName) return Response.json({ ok: false, error: "Please enter your first and last name." }, { status: 400 });
  if (!email) return Response.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });

  try {
    if (await hasAccess(email)) {
      const token = await signToken("link", { e: email, fn: firstName, ln: lastName, exp: Date.now() + LINK_TTL_MS });
      const link = new URL(`/api/verify?t=${encodeURIComponent(token)}`, req.url).toString();
      await sendLoginEmail(email, link, firstName);
    }
  } catch (err) {
    console.error("Login link request failed:", err);
    return Response.json({ ok: false, error: "Something went wrong. Please try again in a minute." }, { status: 502 });
  }

  return Response.json({ ok: true });
};

export const config = {
  path: "/api/request-link",
  method: "POST",
};
