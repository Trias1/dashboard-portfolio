# PortfolioKit

A portfolio builder: fill in your experience, projects and skills once, pick one of 17 layouts, and publish a page you can share with clients or recruiters.

- Production: <https://portfolio.west-solutions.web.id> (previously `portfolio.tzm.web.id`)
- Demo / staging: <https://demo-portfolio.tzm.web.id>

PortfolioKit is free and open-source software under the [MIT License](LICENSE).

## Features

- **Section builder** — drag to reorder, hide or add sections (hero, about, experience, projects, skills, education, certifications, languages, awards, organizations, services, gallery, testimonials, contact, custom).
- **17 templates** and two colour themes (dark / light). Switching template keeps your content.
- **Publish and share** — your own `/portfolio/<slug>` link, or a custom domain.
- **CV tools** — import a PDF CV into your sections (works without AI via a keyword parser), and generate a printable CV/PDF from your portfolio in three layouts.
- **GitHub import** — pull your profile and selected repositories into projects and skills.
- **Statistics** — daily visits per portfolio.
- **Contact form** — messages are emailed to the account owner.
- **Advisor (optional)** — AI suggestions for your content when an AI provider is configured.
- **Admin** — user management, platform stats and Vercel runtime logs for the superadmin.

## Tech stack

Next.js 16 (App Router, `src/proxy.ts`), React 19, TypeScript, Tailwind CSS v4, Supabase (Postgres + Storage, accessed server-side with the service-role key), `jose` JWTs, Nodemailer (Gmail SMTP), Recharts, dnd-kit, html2pdf.js.

## Getting started

Requirements: Node.js 20+, npm, a Supabase project, and a Gmail account with an app password for outgoing mail.

```bash
git clone https://github.com/Trias1/dashboard-portfolio.git
cd dashboard-portfolio
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000 (use -p 3001 if 3000 is taken)
```

Other scripts:

```bash
npm run lint    # ESLint (must report 0 errors — see "Git hooks" below)
npm run build   # production build
npm start       # serve the production build
```

## Environment variables

Put these in `.env.local` locally and in the Vercel project settings for deployments. **Never commit real values.**

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public Supabase URL/anon key. Row Level Security must stay enabled on every table. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-side database and storage access. Server only. |
| `SUPABASE_STORAGE_BUCKET` | yes | Bucket for uploads (photos, project images, CVs, gallery). |
| `NEXT_PUBLIC_BASE_URL` | yes | Public origin of this deployment, e.g. `https://portfolio.west-solutions.web.id`. Used for links, SEO and to recognise the app's own host. |
| `MAIN_DOMAINS` | no | Extra comma-separated hosts that serve the app itself (not users' custom domains). `NEXT_PUBLIC_BASE_URL`, `*.vercel.app`, localhost and `tzm.web.id` are already included. |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | yes | Signing keys, **at least 32 characters each**, different from each other and per environment. |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | no | Token lifetimes (default `15m` / `7d`). |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_FROM_NAME` | yes | Outgoing mail: verification, login codes, password reset, contact messages. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | for Google login | Redirect URI is `<base url>/api/auth/google/callback`; add it in Google Cloud Console for every domain. |
| `GITHUB_TOKEN` | no | Raises GitHub API limits for the import. Use a token with no scopes. |
| `NINE_ROUTER_API_KEY`, `NINE_ROUTER_BASE_URL`, `NINE_ROUTER_MODEL` | no | AI provider for the Advisor, visitor chat and AI CV parsing. Without them those features degrade gracefully. |
| `VERCEL_TOKEN`, `VERCEL_TOKEN_PROD`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` | no | Superadmin "Server" panel (Vercel runtime logs). Team ID only for team projects. |

## Authentication and security

- **Login** is two-step: email + password, then a 6-digit code sent by email. The code is never stored in plain text — the server keeps an HMAC of it in a short-lived signed httpOnly cookie, attempts are rate-limited, and a code can only be requested after the password check passed.
- Access tokens (15 min) and refresh tokens (7 days) are separate JWTs with their own secrets and audiences, stored in httpOnly cookies.
- Google sign-in uses a `state` cookie and only links to an existing account when Google reports the email as verified.
- Changing email or password requires the current password; passwords must be at least 8 characters.
- Every data route checks ownership (`owner_id`); unpublished portfolios are only visible to their owner.
- Uploads are validated by their actual file bytes (PNG/JPEG/WebP/GIF images, PDF/DOC/DOCX), size-limited and stored under random names.
- Rate limits (per IP and per account) protect login, codes, contact form, AI and uploads. They are stored in the `rate_limits` table.
- Emails escape all user content; contact messages go to the owner's verified account email.
- Basic security headers are set in `next.config.ts`.

## Branches and deployment

| Branch | Deploys to | Use |
| --- | --- | --- |
| `main` | Vercel project `portfolio-vercel` → production | Only merge after it has been checked on the demo. |
| `staging` | Vercel project `demo-portfolio` → demo | Test new work here first. |
| feature branches | Vercel preview URLs | Day-to-day work. |

Flow: feature branch → merge into `staging` → check the demo → merge into `main`.

The demo and production currently share one Supabase database, so use a test account on the demo.

## Git hooks

A global pre-push hook runs `npm run lint` and `npm run build`; a push is rejected if either fails. Don't bypass it. Before pushing, also make sure no credentials are in the diff.

## Custom domains

Users can map their own domain to a published portfolio:

1. In the dashboard, set the custom domain (stored without protocol, path, port or trailing dot).
2. Add the same domain to the Vercel project and point its DNS to Vercel.

Requests on that host are rewritten internally to `/portfolio/<slug>`; the address bar keeps the custom domain. Only published portfolios are served. `/login` and `/dashboard` on a custom domain redirect to the main site.

## Templates

| Template | Idea |
| --- | --- |
| Modern | Large name in a grotesk, two-column work list with years |
| Creative | Printed-portfolio sidebar, image-led project grid |
| Minimal | One narrow column of text, like a personal homepage |
| Bold | Poster type and solid colour blocks |
| Classic | Reads like a CV — dates in a left column, "References" |
| Neon | Night-flyer feel with outlined headings |
| Glass | One frosted header over a full-bleed photo, flat content below |
| Nature | Field notebook — serif italics, hand-drawn dividers |
| Vibrant | Three flat colours, playful blocks |
| Retro | Photocopied zine — monospace, borders, dotted rules |
| Immersive | Full-bleed bands, big type, subtle hero parallax |
| Playful | Sticker book — rounded type, tilted labels |
| Developer | Terminal / README — file-tree projects, `git log` experience |
| Swiss | Strict 12-column grid, big numerals |
| White | Quiet editorial on white |
| Agency | Studio site with numbered services and case-study rows |
| BoldPersona | Huge name, portrait, short punchy sections |

All templates take `{ data, theme, isPreview }`, follow the user's section order, and derive readable text colours from the chosen theme.

## Project structure

```text
src/
├─ app/             pages, layouts and API routes (src/app/api/**)
├─ components/      shared UI (dashboard/, builder/, AuthShell, ContactForm, …)
├─ hooks/           dashboard data hooks
├─ lib/             auth, rate limiting, mailer, Supabase clients, CV parser/document, upload validation
├─ templates/       the 17 portfolio templates
├─ types/           shared TypeScript types
└─ proxy.ts         host routing (custom domains, main domains)
supabase/migrations SQL migrations
public/             static assets
```

## License

[MIT](LICENSE). Built by Trias.
