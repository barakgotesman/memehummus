# Meme Hummus — Development Guide

A meme hub web app for browsing templates and generating memes easily.

## Language & Direction

- The app is in **Hebrew**. All UI text must be written in Hebrew.
- Layout direction is **RTL** (`dir="rtl"`). Apply `dir="rtl"` on page/component root elements.
- Use `text-right` as the default text alignment unless content is inherently LTR (e.g. URLs, code).
- Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`) are preferred over `ml-`/`mr-` where RTL matters.

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, shadcn/ui, Vite
- **Backend:** Node.js, Express 5, TypeScript — deployed as a Vercel Serverless Function via `api/index.ts`
- **Auth:** Firebase (Google OAuth) — `backend/lib/firebase.ts`, `frontend/src/lib/firebase.ts`
- **Image storage:** Cloudinary — `backend/lib/cloudinary.ts`
- **Database:** Neon (PostgreSQL) + Prisma 7 ORM (queries via `@prisma/adapter-pg`)
- **Hosting:** Vercel — frontend (static) + backend (serverless) on one deployment
- **Language:** TypeScript everywhere — all new files must be `.ts` / `.tsx`, no plain `.js`

---

## Project Structure

```
memehummus/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── admin/         # Admin-only components
│   │   │   ├── generator/     # Meme editor components
│   │   │   ├── home/
│   │   │   ├── layout/        # Navbar, Footer, BottomNav
│   │   │   ├── memes/         # Template grid, card, filter
│   │   │   ├── search/
│   │   │   └── ui/            # Reusable primitives (shadcn-style)
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── data/              # Static/mock data
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/
│   │   │   ├── firebase.ts    # Firebase client SDK (auth)
│   │   │   ├── api.ts         # Public API calls
│   │   │   ├── adminApi.ts    # Admin API calls (auth-protected)
│   │   │   └── utils.ts
│   │   ├── pages/             # Route-level page components
│   │   │   └── admin/         # Admin sub-pages
│   │   ├── styles/            # Global CSS
│   │   ├── types/             # Shared TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── tsconfig.json
│
├── backend/                   # Express API server
│   ├── controllers/           # Request handlers
│   ├── routes/                # Route definitions (endpoints only)
│   ├── services/              # Business logic + DB queries
│   ├── middleware/            # Auth, error handling
│   ├── lib/
│   │   ├── firebase.ts        # Firebase Admin SDK (auth token verification)
│   │   ├── cloudinary.ts      # Cloudinary client (image storage)
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── AppError.ts        # Custom error class
│   ├── types/                 # Express type augmentations (req.user)
│   ├── prisma/
│   │   └── schema.prisma
│   ├── scripts/
│   │   ├── seedTemplates.mjs  # Seeds template images to Cloudinary + DB
│   │   ├── create-tables.mjs  # Creates DB tables (run once on new DB)
│   │   └── set-admin.ts       # Grants isAdmin Firebase custom claim
│   ├── prisma.config.ts
│   ├── index.ts               # Server entry point
│   └── tsconfig.json
│
├── package.json               # Single package — shared node_modules
└── .env                       # Never committed — see env vars below
```

### Required environment variables (`.env`)
```
DATABASE_URL=          # Neon PostgreSQL connection string
CLIENT_URL=            # Frontend origin (e.g. http://localhost:5173 or production URL)
PORT=3001
IP_HASH_SALT=          # Random hex string for IP hashing

# Local dev: path to JSON file. Production (Vercel): use FIREBASE_SERVICE_ACCOUNT_JSON instead
FIREBASE_SERVICE_ACCOUNT_PATH=  # Path to Firebase service account JSON (never commit the JSON)
FIREBASE_SERVICE_ACCOUNT_JSON=  # Full JSON string of service account (used on Vercel)

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Dev commands
- `npm run dev` — Vite dev server (port 5173, proxies `/api` → 3001)
- `npm run server` — Express backend via `tsx` (port 3001)
- `npm run build` — Production frontend build → `dist/`

### Deployment (Vercel)
- **Production URL:** https://meme-hummus.vercel.app
- **Deploy:** `vercel --prod` or push to `main` (once GitHub is connected in Vercel dashboard)
- **Build command:** `npx prisma generate --schema=backend/prisma/schema.prisma && npm run build`
- **Serverless entry:** `api/index.ts` imports Express app from `backend/index.ts`
- **Routing:** `vercel.json` routes `/api/*` → serverless function, everything else → SPA
- **Prisma:** must run `prisma generate` before build — already wired into `vercel.json` buildCommand
- **Firebase service account:** stored as `FIREBASE_SERVICE_ACCOUNT_JSON` env var on Vercel (full JSON string)

---

## Development Approach

- Work **step-by-step**. Do not try to build everything at once.
- Break every feature into the smallest logical unit before starting.
- Each step must be independently testable before moving to the next.
- If a step feels too large, split it further.
- Always confirm the current step is complete and working before proceeding.

---

## Git Workflow

- **Never commit automatically.** Always wait for explicit user approval.
- After completing a logical unit of work, suggest a commit message and wait.
- Suggested commit messages should follow conventional commits format:
  - `feat: add meme template grid component`
  - `fix: resolve image loading error on mobile`
  - `refactor: extract meme card into reusable component`
- Do not run `git add`, `git commit`, or `git push` without user instruction.

---

## Design System

- Use the **"Meme Hummus" Stitch project** as the visual reference for all UI decisions.
- Follow shadcn/ui patterns and component conventions consistently.
- Do not invent new design patterns — extend what already exists in the system.
- Maintain visual consistency: spacing, typography, color tokens, border radii.
- When in doubt about a design decision, ask before building.

---

## Responsiveness

- **Mobile-first is mandatory.** Build for small screens first, then scale up.
- Breakpoint order: `mobile → tablet (md) → desktop (lg/xl)`.
- Every component must work on all screen sizes before being considered done.
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) — never hardcode pixel widths.
- Test layouts at 375px, 768px, and 1280px as the minimum checkpoints.

---

## Frontend Standards

### Component Architecture
- One component per file. Name files and components identically.
- Separate into: `components/`, `pages/`, `hooks/`, `lib/`, `types/`.
- Prefer small, focused components over large monoliths.
- Extract reusable UI into `components/ui/` (shadcn-style).

### State Management
- Keep state as local as possible — lift only when necessary.
- Use React context sparingly, only for truly global state (auth, theme).
- Avoid prop drilling beyond 2 levels — introduce context or composition instead.

### Code Quality
- No inline styles. Use Tailwind utility classes only.
- Avoid magic numbers and hardcoded strings — use constants or config.
- Handle loading, error, and empty states for every data-fetching component.
- Validate props with TypeScript types — no `any`, no implicit untyped props.

---

## Backend Standards

### Architecture
- Modular structure: `routes/`, `services/`, `middleware/`, `lib/`.
- Routes define endpoints only — delegate all logic to services.
- Services handle business logic — all DB access goes through Prisma (`lib/prisma.ts`).
- Firebase Admin (`lib/firebase.ts`) is used for auth token verification only.
- Cloudinary (`lib/cloudinary.ts`) is used for image storage only.

### Error Handling
- Every route must have try/catch with meaningful error responses.
- Return consistent error shape: `{ error: string, status: number }`.
- Validate all incoming request data before processing.
- Never expose internal error details to the client.

### Auth & Storage
- Auth: Firebase Admin SDK verifies JWT tokens in `middleware/auth.ts`.
- Admin role: Firebase custom claim `isAdmin: true` — set via `backend/scripts/set-admin.ts`.
- Images: uploaded to Cloudinary, stored as `public_id` in DB (`file_path` column).
- Cloudinary signed uploads: backend generates signature → frontend uploads directly to Cloudinary.

---

## Coding Standards

- Write code that reads clearly without needing explanation.
- Prefer simple, direct solutions over clever abstractions.
- Add a comment only when the **why** is non-obvious — not the what.
- Write notes and reminders directly in the relevant source files as comments, not in CLAUDE.md.
- Do not over-engineer. If the simplest solution works, use it.
- Delete unused code immediately. Do not leave commented-out blocks.
- Think like a senior full-stack engineer: readable, maintainable, pragmatic.

---

## Collaboration Style

- Act as a **senior developer guiding this project**, not just an executor.
- Proactively suggest improvements when a better approach exists.
- If a decision seems like a mistake, say so clearly — explain why and offer an alternative.
- Keep explanations brief but useful. The user can ask for more detail if needed.
- When starting a new feature, briefly outline the plan before writing any code.
- Flag potential issues (performance, security, UX) before they become problems.

---

## Feature Build Order (General Principle)

For any new feature, follow this sequence:
1. Define the data shape / API contract
2. Build the backend route + service
3. Build the frontend component (static/mocked first)
4. Connect frontend to backend
5. Handle all states (loading, error, empty, success)
6. Test responsiveness
7. Review and suggest commit

---

## Project-Specific Notes

- The core flows are: **browse templates → select template → generate meme**.
- Keep the generation UX fast and lightweight — this is a fun, casual tool.
- Performance matters: lazy load images, avoid unnecessary re-renders.
- Accessibility is not optional: use semantic HTML, alt text on all images, keyboard-navigable UI.
