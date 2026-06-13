# Home Inventory App

A personal inventory management PWA for home and storage use. Photograph items, let AI identify them, and organize by area/sub-area.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Set up Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/migration.sql`
3. Copy your Project URL and anon key into `.env.local`

### 4. Get a Gemini API key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a free API key (1,500 req/day free tier)
3. Add to `.env.local` as `GEMINI_API_KEY`

### 5. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **AI identification** — photograph an item, Gemini Flash identifies it automatically
- **Offline-first** — works without internet, syncs when reconnected
- **Areas & Sub-Areas** — organize storage locations (e.g. Kitchen › Top Shelf)
- **Removal log** — track when items are used, sold, discarded, moved
- **PWA** — installable on mobile homescreen, no App Store needed
- **Desktop + mobile** — same URL, fully responsive

## Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- Supabase (PostgreSQL + Storage)
- Dexie.js (IndexedDB offline sync)
- Google Gemini Flash 2.0 (AI vision)

## Deploy

Push to GitHub and deploy on [Vercel](https://vercel.com) — add the three env vars in project settings.
