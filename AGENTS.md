<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PortfolioKit Project Context

Read README.md first (env vars, auth flow, branches: feature → staging (demo) → main (prod)).

## Design rules (UI must not look AI-generated)
- No purple/cyan gradients, gradient text, glows, blurred blobs, particles, glass cards everywhere, emoji icons, fade-in-on-scroll everywhere, hover-lift on every card.
- App UI (landing, auth, dashboard) uses the tokens in src/app/globals.css: bg-paper, bg-paper-deep, text-ink, text-ink-soft, border-rule, accent (#1f45c9), accent-dark; font-display (Bricolage Grotesque) for titles, Geist for UI, mono for numbers/slugs. Do not make it look like Claude (no cream + serif + orange).
- Shared form pieces: src/components/AuthShell.tsx (Field, SubmitButton, Notice).

## Templates (17, src/templates/*.tsx)
- Each has its own personality (see README "Templates"). Props: `{ data, theme, isPreview }`.
- Derive text/border colours from `theme.bg` lightness and keep accent contrast ≥ 4.5:1; themes come from src/lib/sections.ts (`dark-space` #111214/#5b8def, `white` #ffffff/#1f45c9).
- Render every section type, follow sections_order, use TechBadge (@/components/TechIcon) for skills/tech stacks, CertificationSection for certifications, ContactForm for contact.
- Registered in src/app/portfolio/[slug]/page.tsx, the dashboard template picker (DashboardPreview) and src/app/demo/page.tsx.

## Checks before pushing
- `npx tsc --noEmit -p .`, `npm run lint` (0 errors), `npm run build` — the pre-push hook enforces lint + build.
- No credentials in commits.
