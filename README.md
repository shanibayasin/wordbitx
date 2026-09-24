# NexaCRM - Modern Multi-Tenant CRM Platform

NexaCRM is an enterprise-grade Customer Relationship Management (CRM) web application designed for high-performing sales, customer success, and operations teams. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui components, Prisma ORM, PostgreSQL, and NextAuth.js.

---

## 🌟 Key Features

1. **Multi-Tenancy by Design**
   - True logical isolation where every single database query automatically scopes to the authenticated user's `organizationId`.
   - Admin registration seamlessly spins up both the tenant Organization and primary Super Admin user.

2. **Full-Funnel Sales Pipeline**
   - Dynamic Kanban Board with drag-and-drop powered by `@dnd-kit/core`.
   - Pipeline stages: `QUALIFIED` → `PROPOSAL` → `NEGOTIATION` → `WON` / `LOST`.
   - Win probability calculator, deal value aggregation, and assignee tracking.

3. **Lead Management & Scoring**
   - High-velocity lead inbox with real-time status filtering (`NEW`, `FOLLOW_UP`, `QUALIFIED`, `LOST`).
   - Lead temperature scores (0-100), acquisition channels, and one-click conversion flows.

4. **360° Customer Intelligence**
   - Comprehensive customer accounts with linked deals, active support tickets, and direct contact details.

5. **Customer Support Helpdesk**
   - Ticket management with status (`OPEN`, `IN_PROGRESS`, `WAITING`, `RESOLVED`) and priority tags (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
   - Assignment to support representatives with client linking.

6. **Executive Dashboard & Analytics**
   - Real-time KPIs: Active Leads, Pipeline Value, Open Tickets, and Tasks Due Today.
   - Revenue trajectory and stage distribution charts rendered with Recharts.

7. **Team Collaboration & RBAC**
   - Role-based Access Control: `ADMIN`, `SALES`, `SUPPORT`, `AGENT`.
   - Team invitation system and granular permissions.

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- Node.js 18.17+ or 20+
- PostgreSQL database instance (local, Supabase, Neon, or Cloud SQL)
- npm or pnpm or yarn

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-org/nexacrm.git
cd nexacrm

# Install required dependencies
npm install
```

### 3. Environment Variables Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `.env` with your PostgreSQL connection string and a secure NextAuth secret:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/nexacrm?schema=public"
NEXTAUTH_SECRET="your_generated_random_secret_token_at_least_32_chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Migration & Prisma Generation
Push your Prisma schema to PostgreSQL and generate the Prisma Client:
```bash
# Push schema directly to database
npx prisma db push

# Or run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
nexacrm/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── leads/page.tsx
│   │   ├── leads/[id]/page.tsx
│   │   ├── pipeline/page.tsx
│   │   ├── deals/[id]/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── customers/[id]/page.tsx
│   │   ├── tickets/page.tsx
│   │   ├── tickets/[id]/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   └── settings/team/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── leads/route.ts
│   │   ├── leads/[id]/route.ts
│   │   ├── deals/route.ts
│   │   ├── deals/[id]/route.ts
│   │   ├── customers/route.ts
│   │   ├── customers/[id]/route.ts
│   │   ├── tickets/route.ts
│   │   ├── tickets/[id]/route.ts
│   │   ├── tasks/route.ts
│   │   ├── tasks/[id]/route.ts
│   │   └── dashboard-stats/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── leads/
│   ├── pipeline/
│   ├── customers/
│   ├── tickets/
│   └── dashboard/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations/
├── prisma/
│   └── schema.prisma
└── types/
    └── index.ts
```

---

## 🛡️ Multi-Tenancy & Security
Every query inside the `app/api/*` routes enforces strict tenant isolation:
```typescript
const leads = await prisma.lead.findMany({
  where: {
    organizationId: session.user.organizationId,
  },
  include: { assignedTo: true },
});
```
Passwords are encrypted using `bcryptjs` and session tokens are strictly validated.
