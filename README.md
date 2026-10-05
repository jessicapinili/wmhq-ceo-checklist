# The WMHQ CEO Checklist Challenge

Member dashboard for the 60-day challenge. React + TypeScript + Tailwind (Vite), hosted on Netlify.

- **Login:** `/login/` emails a 15-minute magic link via Resend; members stay logged in for 90 days.
- **Admin:** `/admin/` (admins only) manages which emails can log in. List stored in Netlify Blobs.
- **Progress:** saved in the member's browser (localStorage), per email. Export/Import in Settings.

## Netlify environment variables

| Name | Required | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | Resend API key |
| `SESSION_SECRET` | yes | Long random string, unique to this site |
| `ADMIN_EMAILS` | no | Comma-separated. Defaults to jessicampinili@gmail.com |
| `MAIL_FROM` | no | Defaults to `Woman Mastery HQ <login@womanmasteryhqportal.com>` |

## Local development

```bash
npm install
npm run dev
```

Locally there is no login server, so the app uses a test member automatically.
