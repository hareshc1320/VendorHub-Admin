# VendorHub Admin — Multi-Vendor Admin Dashboard

A modern, full-featured admin dashboard built with **React 19**, **TypeScript**, **TanStack Router**, **TanStack Query**, and **Tailwind CSS v4**.

---

## Features

- **Dashboard** — animated KPI cards, revenue chart (7D / 1M / 3M / 1Y), quick actions, top products
- **Products** — list, add, edit, delete with real-time search and category filter
- **Orders** — manage orders, update status, CSV export
- **Customers** — customer directory with VIP tier, order history
- **Reports** — revenue, category, performance analytics modal
- **Notifications** — real-time notification centre with read/dismiss
- **Pricing** — manage subscription plans (monthly / yearly toggle)
- **Settings** — profile update, store info, theme toggle (dark / light)
- **Authentication** — JWT login / register, protected routes, session persistence

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5 |
| Routing | TanStack Router v1 |
| Data Fetching | TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI) |
| Charts | Recharts |
| Animations | Framer Motion |
| Build Tool | Vite 8 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- VendorHub API running (see `VendorHub-API` project)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set VITE_API_URL to your API server

# 3. Start development server
npm run dev
```

The admin panel will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | VendorHub API base URL | `http://localhost:3001/api` |

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder. Serve with any static file server or CDN.

---

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── dashboard-layout.tsx
│   ├── sidebar-nav.tsx
│   ├── top-navbar.tsx
│   └── ...modals
├── hooks/               # Custom React hooks
├── lib/
│   ├── api-client.ts    # Fetch wrapper + JWT helpers
│   ├── api-hooks.ts     # TanStack Query hooks
│   ├── auth-context.tsx # Authentication context
│   ├── dashboard-context.tsx
│   ├── mock-data.ts     # TypeScript types + seed data
│   ├── theme.ts         # Dark / light theme hook
│   └── utils.ts         # Utility functions
├── routes/              # Page components (one per route)
├── router.tsx           # TanStack Router tree
└── main.tsx             # App entry point
```

---

## Default Login

After running the API seed script:

| Field | Value |
|---|---|
| Email | `admin@vendorhub.io` |
| Password | `admin123` |

---

## License

Regular / Extended License — Envato Market.
