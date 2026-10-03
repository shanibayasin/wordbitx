# WordbitX CRM

WordbitX is a CRM application built with Next.js App Router, React 19, TypeScript, and Tailwind CSS 4. The CRM dashboard UI and its current interactions were migrated from the original Vite application.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build and run

```bash
npm run lint
npm run build
npm run start
```

## Routes

The CRM provides login and registration pages plus dashboard, leads, pipeline, deals, customers, orders, tickets, tasks, reports, settings, and team-management routes. Record details use dynamic `[id]` routes.

The public marketing website remains a separate application. Its sign-in and sign-up calls should target the CRM `/login` and `/register` pages.

## Current data behavior

This migration preserves the existing frontend data behavior; it does not connect the CRM UI to MongoDB. Seed data and most record edits live in the running browser session. Customers, deals, and orders are also read from and written to browser `localStorage`. Existing API handlers, Mongoose models, authentication configuration, and upload integrations remain in the repository for later integration work.

Do not treat the demo login/register flow or browser-local data as production authentication or shared CRM persistence.

## Project layout

- `app/` — App Router pages, layouts, API handlers, and global styles
- `components/` — CRM feature and shared UI components
- `lib/` and `models/` — existing service, validation, and Mongoose code
- `src/App.tsx` — migrated CRM client experience and its existing workflows
- `types/` — shared CRM types
