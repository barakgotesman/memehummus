# Meme Hummus 🧆

A Hebrew, RTL meme hub: browse meme templates, pick one, and generate your own meme in seconds.

**Live:** https://meme-hummus.vercel.app

## Features

- Browse and search meme templates, filter by tags
- Meme editor: add text, or upload your own image / start from a blank template
- Suggest new templates
- Contact form with rate limiting
- Google sign-in (Firebase)
- Admin panel: manage templates, tags, suggestions, and contact submissions (with read/unread tracking)
- Mobile-first, dark/light theme

## Tech Stack

| Layer    | Tech                                                          |
| -------- | ------------------------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui-style components      |
| Backend  | Node.js, Express 5, TypeScript                                |
| Auth     | Firebase Auth (Google OAuth), Firebase Admin for verification |
| Database | Neon (PostgreSQL) + Prisma 7 (`@prisma/adapter-pg`)           |
| Images   | Cloudinary (signed direct uploads)                            |
| Hosting  | Vercel — static frontend + Express as a serverless function   |

## Project Structure

```
memehummus/
├── api/index.ts       # Vercel serverless entry (imports the Express app)
├── frontend/          # React + Vite app
│   └── src/           # components, pages, hooks, context, lib, types
├── backend/           # Express API
│   ├── routes/        # Endpoint definitions
│   ├── controllers/   # Request handlers
│   ├── services/      # Business logic + Prisma queries
│   ├── middleware/    # Auth, error handling
│   ├── lib/           # Firebase Admin, Cloudinary, Prisma, AppError
│   ├── prisma/        # schema.prisma
│   └── scripts/       # Seeding, table creation, admin grant
├── vercel.json
└── package.json       # Single package for frontend + backend
```

## Getting Started

### Prerequisites

- Node.js 20+
- A Neon PostgreSQL database
- A Firebase project (Google sign-in enabled) and a service account JSON
- A Cloudinary account

### Setup

```bash
npm install
npx prisma generate --schema=backend/prisma/schema.prisma
```

Create a `.env` file in the project root:

```env
DATABASE_URL=                   # Neon PostgreSQL connection string
CLIENT_URL=http://localhost:5173
PORT=3001
IP_HASH_SALT=                   # Random hex string for IP hashing

# Local: path to the service account JSON. Vercel: use FIREBASE_SERVICE_ACCOUNT_JSON (full JSON string)
FIREBASE_SERVICE_ACCOUNT_PATH=
FIREBASE_SERVICE_ACCOUNT_JSON=

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

> Never commit `.env` or the Firebase service account JSON.

### Database

On a fresh database, create the tables and (optionally) seed templates:

```bash
node backend/scripts/create-tables.mjs
node backend/scripts/seedTemplates.mjs
```

### Run locally

Run both in separate terminals:

```bash
npm run server   # Express API on :3001
npm run dev      # Vite on :5173 (proxies /api → :3001)
```

### Granting admin access

Admins are identified by the Firebase custom claim `isAdmin: true`:

```bash
npx tsx backend/scripts/set-admin.ts <user-email>
```

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the Vite dev server                |
| `npm run server`    | Start the Express backend via `tsx`      |
| `npm run build`     | Production frontend build → `dist/`      |
| `npm run preview`   | Preview the production build             |
| `npm run lint`      | Run ESLint                               |

## Deployment

Deployed on Vercel. `vercel.json` routes `/api/*` to the serverless function (`api/index.ts`) and everything else to the SPA. The build command runs `prisma generate` before the Vite build.

Set all environment variables in the Vercel dashboard, using `FIREBASE_SERVICE_ACCOUNT_JSON` (the full JSON string) instead of the file path.

```bash
vercel --prod
```

## Conventions

- All UI text is Hebrew; layouts are RTL (`dir="rtl"`)
- TypeScript only — no plain `.js` source files
- Mobile-first responsive design
- See [`CLAUDE.md`](./CLAUDE.md) for the full development guide
