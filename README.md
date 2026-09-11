# AetherPM Web

Web port of [AetherPM](https://github.com/Geopossib/AetherPM) (the Tauri
desktop app) — same UI and feature set, backed by Supabase (Postgres +
Auth + Storage) instead of a local SQLite file, deployable to Vercel.

## What changed vs the desktop app

- **Data layer**: `src/lib/api.ts` was rewritten to call Supabase
  directly instead of Tauri's `invoke()`. Every function keeps the same
  name and signature, so every screen/component works unchanged.
- **Auth**: the app is now gated behind Supabase email/password sign-in
  (`src/components/AuthGate.tsx`) — data access requires an account.
- **Attachments**: uploads go to Supabase Storage instead of referencing
  a local file path.
- **Export/Import**: uses browser download/file-picker instead of native
  save/open dialogs.
- **Cloud panel**: simplified to account + sign-out, since on the web
  everything is already "cloud" — no local-vs-cloud distinction needed.

## One-time setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Run the schema**: open your project's SQL Editor and run the contents of
   [`supabase/schema.sql`](./supabase/schema.sql).
3. **Create a Storage bucket** named `attachments` (Storage → New bucket → private).
4. **Enable email auth** (on by default) under Authentication → Providers.
5. Copy your project's URL and anon public key (Project Settings → API).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm run dev
```

## Deploying to Vercel

1. Import this GitHub repo into Vercel.
2. In the Vercel project's Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy — Vercel auto-detects Next.js, no build config needed.

## Known limitations (Phase 1)

- **Single shared workspace**: Row Level Security currently allows any
  signed-in user to read/write all data (see the comment in
  `supabase/schema.sql`). This is fine for one person or a trusted small
  team; before inviting outside collaborators, tighten the RLS policies
  to check `project_members` per request.
- **No per-project sharing/invite flow yet** — the desktop app's
  file-based project export/import still works (Settings → Backup &
  sharing), but there's no in-app "invite a teammate to just this
  project" flow yet.
- Diagram editing (SysML) writes nodes/edges as a full replace-on-save
  rather than incremental sync — fine for one editor at a time, not
  built for concurrent multi-user diagram editing yet.
