# Parli Pro Study — HOSA Parliamentary Procedure

Personal study app: 1,610 deduplicated questions from the Dunbar test bank,
tagged to HOSA's 12-topic Round 1 test plan, with a synced progress dashboard.

## Deploy

Requires Node 18+. From this folder:

```bash
npm install
npx vercel --prod
```

First run will ask you to log in and confirm a project name. Accept the
detected Vite settings.

**Turn on deployment protection right after the first deploy:**
Vercel dashboard → your project → Settings → Deployment Protection →
enable **Vercel Authentication** for *All Deployments*. This keeps the
question bank off the open web (see "Content" below).

## Local development

```bash
npm install
npm run dev
```

## Backend

Supabase project `parli-pro-study` (`eqjexfceuwmsujhjvfim`), already
provisioned. Credentials are in `src/lib/supabase.js` — the publishable key
is safe to ship; row-level security restricts it to reading/writing your
attempt history only. The passcode hash is unreadable by that key.

Default passcode: `parlipro` — change it in the app under Settings.

Tables: `attempts`, `flags`, `exam_sessions`, `app_settings`.

## Content

Questions derive from Dunbar's Manual of Parliamentary Procedure Test
Questions, which is copyrighted and all-rights-reserved. Keep this
deployment behind Vercel Authentication so it stays a personal study tool
rather than a republication.
