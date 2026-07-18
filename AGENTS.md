<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PortfolioKit Project Context

## Templates (17 total)
- `modern.tsx` — Default dark-elegant, animated particles, scroll progress bar, tech badges via TechBadge component
- `creative.tsx` — Left sidebar layout, rounded cards, uses TechBadge for skills & project tech stack
- `minimal.tsx` — Minimal typography-focused, clean layout, uses TechBadge for skills & project tech stack
- `bold.tsx` — Gradient-heavy, neon glow effects, glassmorphism cards, animated particles, gradient titles

All templates receive `{ data, theme, isPreview? }` props and render portfolio sections.

## Template Registration
- `portfolio/[slug]/page.tsx` — imports all 17, routes by templateName
- `dashboard/page.tsx` — template selector dropdown has 17 options
- `demo/page.tsx` — 17 template buttons in the picker

## Key Component: TechBadge
- Import: `@/components/TechIcon`
- Props: `{ name, accentColor, size?: 'sm'|'md', variant?: 'pill'|'outline'|'filled', textColor? }`
- Always use TechBadge for skills/project tech_stack across all templates

## Auth Pages
- All use consistent gradient border card pattern, animated bg blobs, Framer Motion entrance
- Theme switcher across login/register pages

## Global CSS
- Smooth scroll, custom scrollbar, selection colors, antialiasing
- Tailwind CSS v4 with `@import "tailwindcss"` and `@theme` directive
