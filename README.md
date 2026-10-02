# MyShortlet

A prototype web platform exploring a short-let real estate investment model, built with Next.js and TypeScript.

> **Status: Prototype / Demo.** This project simulates its core flows end-to-end — accounts, wallets, investments, deposits, withdrawals — using mock data and an in-memory service layer. No real payments, banking, or crypto integrations are connected. All figures and returns shown in the app are illustrative only.

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript (strict)
- **Styling:** Tailwind CSS, shadcn/ui component primitives
- **Animation:** Framer Motion
- **Data (current):** In-memory mock service layer, structured for a future relational database migration
- **Deployment target:** Vercel

## Project Status

The frontend — public marketing pages, authentication flow, investor dashboard, and admin tooling — is feature-complete against the current mock data layer. Backend persistence (a real database) is the next phase of work and is not yet implemented; data does not currently persist across server restarts.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build check
```

## High-Level Structure

```
app/          Route pages (App Router)
components/   UI components, organized by feature area
lib/          Services, types, and shared utilities
public/       Static assets
```

Further internal documentation (data model, business rules, architectural decisions) is maintained privately and is not included in this repository.

## License

All rights reserved. This is a private prototype; no license is granted for reuse, distribution, or derivative work.