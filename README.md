# Dashboard Portfolio

A modern portfolio dashboard for creating, managing, and publishing professional portfolios quickly.

This project is free and open-source software available under the [MIT License](LICENSE). Contributions, improvements, and community use are welcome.

## Features

- Drag-and-drop portfolio builder
- Multiple responsive portfolio templates
- Customizable color themes
- AI Advisor for content assistance
- GitHub profile import
- Visitor analytics
- User and role management
- Portfolio PDF export

## Tech Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS v4
- Supabase
- Framer Motion
- React Hook Form
- Recharts

## Prerequisites

- Node.js 18 or newer
- npm
- Access to the services used by the application, such as Supabase and related backend APIs

## Installation

```bash
git clone https://github.com/Trias1/dashboard-portfolio.git
cd dashboard-portfolio
npm install
```

## Environment Configuration

Create a `.env.local` file in the project root using the environment variables required by the application. Local environment files must not be committed to the repository.

Use secrets from each service dashboard for variables related to the database, authentication, email, storage, and AI integrations. Never put tokens, passwords, private keys, or service-role keys directly in the source code.

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Production Build

```bash
npm run build
npm start
```

Linting is available with:

```bash
npm run lint
```

## Main Structure

```text
src/
|-- app/          # Pages, layouts, and API routes
|-- components/   # Shared UI components
|-- lib/          # Helpers and service integrations
`-- templates/    # Portfolio templates
supabase/         # Database configuration and migration scripts
public/           # Static assets
```
## Portfolio Templates

| Template | Style |
| --- | --- |
| Modern | Dark and elegant with smooth animations |
| Creative | Editorial sidebar layout with rounded cards |
| Minimal | Clean typography focused on content |
| Bold | Gradients, neon glow, and glassmorphism |
| Classic | Traditional professional presentation |
| Neon | Cyber-inspired neon interface |
| Glass | Layered glassmorphism cards |
| Nature | Organic colors and soft layouts |
| Vibrant | Bright colors and expressive sections |
| Retro | Nostalgic visual styling |
| Immersive | Full-screen visual storytelling |
| Playful | Friendly shapes and energetic colors |
| Developer | Code-inspired developer portfolio |
| Swiss | Structured grid and bold typography |
| White | Clean light professional layout |
| Agency | Polished studio and service presentation |
| BoldPersona | Strong personal-brand typography |
## Deployment

Build the application first, then deploy it to a Node.js platform that supports Next.js. Configure all production environment variables through the deployment platform's secret manager instead of committing them to the repository.

## Security Notes

- Never commit `.env*` files, credentials, or private keys.
- Use separate environment variables for development and production.
- Keep service-role keys restricted to server-side code.

## Vercel Logs Configuration

The superadmin Server panel reads the latest Vercel runtime events server-side. Configure these variables in Vercel Project Settings; never commit their values:

```env
VERCEL_TOKEN=
VERCEL_TOKEN_PROD=
VERCEL_PROJECT_ID=
VERCEL_TEAM_ID=
```

`VERCEL_TEAM_ID` is optional for personal projects and required when the Vercel project belongs to a team.

## Custom Domains

Custom domains map directly to a published portfolio. Configure the domain in the dashboard, add the same domain manually in Vercel Project Settings, and point its DNS to Vercel.

Example:

- Portfolio slug: `trias-portfolio`
- Custom domain: `portfolio.trias.id`
- Public URL: `https://portfolio.trias.id`
- Internal route: `/portfolio/trias-portfolio`

The browser keeps the custom domain in the address bar while the app rewrites the request internally. Only published portfolios are served. Domain values are stored without protocol, path, port, or trailing dot.
## License

PortfolioKit is open-source software released under the [MIT License](LICENSE).

Built with care by Trias.
