# Dashboard Portfolio

A modern portfolio dashboard for creating, managing, and publishing professional portfolios quickly.

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
├── app/          # Pages, layouts, and API routes
├── components/   # Shared UI components
├── lib/          # Helpers and service integrations
└── templates/    # Portfolio templates
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

## Deployment

Build the application first, then deploy it to a Node.js platform that supports Next.js. Configure all production environment variables through the deployment platform's secret manager instead of committing them to the repository.

## Security Notes

- Never commit `.env*` files, credentials, or private keys.
- Use separate environment variables for development and production.
- Keep service-role keys restricted to server-side code.
