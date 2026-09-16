# Parli Pro Study — Project Handoff

A study web app for Guru Balaji's HOSA Parliamentary Procedure team.

## 1. What this is

React + Vite web app for HOSA's Parliamentary Procedure competitive event. Team members log in with a name + PIN, practice a 1,610-question bank, take mock 50-question timed tests, and track individual + team progress on a weekly-resetting leaderboard.

* GitHub repo: `Guru-Balaji18/Parli-Pro` (recommend keeping it private — see Copyright section)
* Deployment: Vercel, connected to the GitHub repo, auto-deploys on push to `main`.
* Backend: Supabase project `parli-pro-study` (see credentials below).
* Status: Live and in real use — 5 real teammates have already signed up and logged 75+ real practice attempts before this handoff was written. Do not run destructive SQL or reset test data against this project without double-checking it isn't real.

## 2. Supabase credentials & schema

```
Project name:    parli-pro-study
Project ID:      eqjexfceuwmsujhjvfim
Org:             zzktbfkpqztgfyrebkhy (free tier)
Region:          us-east-2
URL:             https://eqjexfceuwmsujhjvfim.supabase.co
Publishable key: sb_publishable_yYHoFVdj4pgwjKKt3gjFKQ_IsxkMk4l
```

The publishable key is already hardcoded in `src/lib/supabase.js` — it's safe to expose client-side by design (that's what "publishable" means), gated by RLS policies rather than secrecy.

### Tables

* `profiles` — `id` (uuid pk), `display_name` (unique), `pin_hash`, `role` (`'member'` | `'captain'`), `created_at`. One row per team member.
* `attempts` — every practice/exam answer: `question_id`, `category_id`, `selected_answer`, `is_correct`, `time_seconds`, `mode` (`practice`/`exam`/`review`/`flagged`), `answered_at`, `user_id` (fk → profiles).
* `flags` — `question_id`, `user_id`: questions a user starred to revisit.
* `exam_sessions` — one row per completed mock test: `question_count`, `correct_count`, `duration_seconds`, `user_id`.

### Functions (all `security definer`, callable by the `anon` key)

* `team_sign_up(name text, pin text)` → creates a profile, hashes the PIN with pgcrypto (`crypt()`/`gen_salt('bf')`). Rejects duplicate names (case-insensitive), names <2 chars, PINs <4 chars.
* `team_login(name text, pin text)` → returns the profile row if the PIN hash matches, else empty.
* `team_leaderboard_since(since timestamptz)` → aggregated per-user stats (total, correct, accuracy, avg_time, last_active) for attempts on/after `since`. Used for the "This Week" leaderboard view.

### View

* `team_leaderboard` — same aggregation as above but all-time (no `since` filter). Views in Postgres run with the owner's privileges by default, which is how this bypasses RLS to aggregate across every user's attempts without needing real per-request auth.

### Security model — read this before "fixing" it

There is no real Supabase Auth here. Login is a custom `name + PIN` system with no JWT, no session token beyond a profile object cached in `localStorage`. This was a deliberate tradeoff: real Supabase Auth requires email confirmation, and there was no tool access to toggle that project setting off remotely, so onboarding a small trusted team with email would have been fragile (confirmation emails, deliverability, rate limits). Given the actual threat model (a handful of trusted teammates practicing quiz questions, not sensitive data), an honor-system PIN was judged an acceptable, disclosed tradeoff — the user was told explicitly that a teammate who knows your name and PIN could see your record.

Consequence: RLS policies on `attempts`/`flags` are permissive (`using (true)` for select, `with check (user_id is not null)` for insert) — they don't actually enforce "you can only see your own rows" at the database level, because there's no real per-request identity to check against. Privacy between teammates is enforced by the app only querying `.eq('user_id', profile.id)` for personal views, not by the database. The weekly/all-time leaderboard intentionally aggregates everyone (that's the point), but a technically savvy teammate could query the anon key directly and see raw per-question attempt data for others. This was disclosed to the user twice (once for the original single-passcode version, again for team accounts) and accepted as fine for this use case. If this app ever needs real security (not just a friendly team tool), this needs to become real Supabase Auth with row-owner-checked RLS (`auth.uid() = user_id`), not a patch on top of the current schema.

### Admin role and hidden PIN hashes (2026-09-16)

* `profiles.role` now allows `member`, `captain`, `admin`; `guru` is the admin. Captain features (Team breakdown) also apply to admins.
* Admin powers are three security-definer functions: `admin_members(p_name, p_pin)`, `admin_member_history(p_name, p_pin, p_member)` and `admin_remove_member(p_name, p_pin, p_member)`. Each re-verifies the caller's name, PIN and `admin` role through `admin_check`, which has EXECUTE revoked from clients. There is no session token, so every admin call carries the PIN. `admin_remove_member` refuses to remove yourself or another admin and explicitly deletes the member's attempts, flags and exam sessions.
* **PIN hashes are no longer readable by clients.** Previously the anon key could `select pin_hash` from `profiles`, and 4-character PINs under bcrypt are cheap to brute-force offline. Table-level SELECT on `profiles` was revoked from `anon`/`authenticated` and re-granted only on `id, display_name, role, created_at`. The app never reads `profiles` directly (only through `team_login`, `team_sign_up`, `team_leaderboard_since` and the `team_leaderboard` view), so nothing broke — verified by running the functions as `anon` in a rolled-back transaction.
* Still-open weak spots: no rate limit on PIN guesses through `team_login` or the admin functions, so the admin account's PIN is the whole defense — keep it long. And `flags` has `PRIMARY KEY (question_id)` alone, so two members can't flag the same question; the second insert fails.

### Legacy — already removed, don't reintroduce

The very first version used a single shared app-wide passcode (`check_passcode`/`change_passcode` functions, `app_settings` table). This was fully replaced by per-user team accounts and the legacy functions/table were dropped in a later migration. If you see references to them in old chat history, they're dead.

## 3. Frontend structure

```
parlipro-app/
├── src/
│   ├── App.jsx              — shell, nav, view routing (no router lib — plain useState)
│   ├── index.css            — design tokens (colors, fonts)
│   ├── App.css              — all component styles (~1300 lines, grew via iterative edits)
│   ├── components/
│   │   ├── TeamAuth.jsx     — login/signup (replaces old Login.jsx, now deleted)
│   │   ├── Dashboard.jsx    — personal stats, charts, streak
│   │   ├── Practice.jsx     — the core quiz engine: practice/exam/review/flagged modes all live here
│   │   ├── Team.jsx         — leaderboard (This Week / All-Time), captain drill-down
│   │   ├── Vocab.jsx        — browse + flashcard modes over vocab.js
│   │   ├── Reference.jsx    — motions chart + study tiers, anchor-linkable
│   │   ├── Settings.jsx     — account info, calibration notes, CSV export, clear history
│   │   └── BrandMark.jsx    — inline SVG seal/ribbon icon
│   ├── data/
│   │   ├── questions.json   — the 1,610-question bank (minified, ~726KB)
│   │   ├── categories.js    — 12 HOSA-topic category definitions
│   │   ├── vocab.js         — 79 terms, 10 groups, self-written definitions
│   │   └── motions.js       — precedence chart data + 4-tier study priority list
│   └── lib/
│       ├── supabase.js      — client init
│       ├── useRecord.js     — hook: loads current user's attempts+flags, plus stat helpers
│       ├── lookup.js        — matches a question's text to a Reference motion or Vocab term (for the "Read more" cross-link)
│       └── challengeWeek.js — Friday 00:00 America/New_York week boundaries, identical on every device regardless of its time zone; DST-safe (weeks spanning a change are 167h/169h)
```

`Practice.jsx` is intentionally one large component handling four modes (`practice`/`exam`/`review`/`flagged`) via a `mode` prop rather than four separate components — they share almost all state logic (timer, answer reveal, flagging, keyboard shortcuts) and only differ in question-pool source and end-of-session behavior.

## 4. The question bank — provenance & known limitations

Parsed and deduplicated from two Dunbar test-question files, `PARLI PRO Practice tests.pdf` and `parliprowrittentests.pdf` (local copies in `C:\Users\namad\Downloads\Telegram Desktop\`). They are real compressed PDFs; an earlier note calling them plain text was wrong. `parliprowrittentests.pdf` follows each question with its answer letter and an RONR page reference in older-edition pagination, which is where `ronr_pages` comes from. Neither file contains answer rationales, so explanations are written from the RONR 12th edition PDF in the same folder (`Downloads\Parli pro book.pdf` is an identical copy). Source: Dunbar's Manual of Parliamentary Procedure Test Questions. Started at ~3,950 raw parsed questions across both files; 2,342 were exact duplicates (the 102 pre-built practice tests are drawn directly from the 1,600-question source manual) → 1,610 unique questions survived, each tagged to one of 12 categories via a keyword-priority classifier (see `categories.js`).

### Cross-checked against the only official HOSA material that exists

HOSA does not release past tests. The event guidelines publish exactly 3 sample questions. Checked all 3 against the bank:

* ✅ Two match exactly (highest rule level = bylaws; two-thirds vote circumstances).
* ⚠️ One has a genuine conflict: HOSA's official answer for "how are special committee members chosen" is "however the motion to commit specifies, if bylaws are silent" and explicitly marks "always appointed by the chair" as wrong — but that's the Dunbar bank's answer for the equivalent question. This is disclosed in-app (Settings page) but not fixed, since fixing it would mean guessing which Dunbar questions are the "same" one HOSA sampled, which isn't reliable.

### Other known gaps (disclosed in-app, Settings page)

* HOSA's real questions have 3 answer choices; every bank question has 4. Slightly easier to guess on the real test than in practice here.
* RONR's 12th edition renamed "Point of Information" → "Request for Information." ~25 questions in the bank still use the old term.
* Zero coverage of electronic/videoconference meeting rules, which the 12th edition added. Not in Dunbar's source material at all.

### A promising unexplored source

Georgia FFA officially publishes ~35 real past Parli Pro written exams (1997–2026) with answer keys, at `https://www.georgiaffa.org/ParliProPastMaterials`. Legitimate — FFA's own rules state Dunbar's Manual is their source too, so this is the same question ecosystem, not a different one. Could not be auto-downloaded: the download links are ASP.NET `__doPostBack()` JS calls, not real URLs, so they only work from an actual browser session. If someone manually downloads a handful (especially ones with answer keys — 2007 State, 2011 State, and the 2016–2026 pairs looked most promising), they could be parsed and merged in the same way the two Dunbar files were.

Explicitly avoided: Quizlet sets, Docsity/Stuvia study guides, and similar crowd-sourced material — these are unauthorized re-uploads of the same copyrighted content, often with transcription errors, not worth the quality risk.

## 5. Copyright — why deployment protection matters

Dunbar's Manual carries an explicit all-rights-reserved notice covering electronic reproduction. Studying from it is fine; putting 1,610 of its questions on an open public URL is closer to republishing it.

**Decision (2026-09-15): Vercel Deployment Protection is deliberately left OFF.** The mitigation on the table was Deployment Protection → Vercel Authentication → All Deployments, which would put the whole site behind Vercel's own login on top of the app's name+PIN gate. The owner weighed that against the friction it creates (every teammate would need a Vercel account to reach the site) and chose to keep the site reachable with only the name+PIN gate, accepting the copyright exposure. Don't re-raise this as an open item.

Still applies regardless: keep the **GitHub repo private**, and don't add more copyrighted question material from unauthorized re-uploads (Quizlet, Docsity, Stuvia).

## 6. Design system — "Open Ledger" concept

Deliberately not a generic SaaS dashboard, since the subject (parliamentary procedure) is literally about procedural documents. Two design passes happened:

Pass 1 (cream background, Fraunces display serif, brass accent, IBM Plex Mono for small labels) — later self-identified as accidentally close to several generic "AI-generated design" patterns (near-identical cream background to the most common default, monospace+uppercase used for plain text labels, middle-dot-joined brand strings).

Pass 2 (current) — structural fix, not just recoloring:

* Whole app sits on a dark navy "cover" canvas (`--cover: #10161d`); each page renders as a lit parchment "page" panel (`--page: #efe6cd`) with a layered shadow — like opening a bound manual, not a flat SPA background.
* Display font swapped Fraunces → EB Garamond (queried via the `ui-ux-pro-max-skill` open-source design-data tool — its curated pairing for "legal/government/formal documents," more period-appropriate than a trendy indie display serif).
* Textual labels that were mono+uppercase (category tags, table headers, status chips) converted to italic-serif "ledger-index" style (`.label-index` utility class) — reads like an old book's index, not a dashboard.
* Dot/dash-joined brand strings removed throughout.
* Added a hand-drawn inline SVG brand mark (`BrandMark.jsx` — a simple seal-and-ribbon), not an icon-font glyph.

On the Mobbin request: the user asked to use the Mobbin connector for design inspiration; it requires a paid plan not available in this session. Used `ui-ux-pro-max-skill` (github.com/nextlevelbuilder/ui-ux-pro-max-skill, 127k-star MIT-licensed open source project) instead — cloned it locally and queried its color/typography/UX datasets directly via its Python search script. Its generic "education" category match wanted purple bubbly Claymorphism aimed at kids' apps — wrong tone, was rejected in favor of more specific "legal/formal document" and "test prep" queries.

⚠️ **UNRESOLVED AT HANDOFF:** the user says the site "still looks ugly" after this second pass, with no specifics given yet. Both design passes were done by code review only, not visual verification — actually look at the rendered output (browser or `npm run dev`) before making further visual changes blind.

## 7. Feature list (for context on what's already built)

* Team accounts: name + PIN signup/login (see security model above)
* Practice mode: category filter (12 categories), endless shuffle, stopwatch (counts up, no limit — user explicitly chose this over a countdown), instant feedback, "Read more on [motion]" cross-link to Reference/Vocab
* Mock Test mode: 50 questions / 60-minute countdown (mirrors real HOSA Round 1), back/forward navigation, full review at the end, flags 70%+ scores (NAP's real recognition threshold)
* Missed Questions: spaced repetition (`lib/review.js`). A missed question stays until it's answered right on 2 different Eastern calendar days since its latest miss; right twice on one day counts once, so a question answered right today waits until tomorrow. Dashboard shows the count due today.
* 3 choices mode: toggle in Practice / Missed / Flagged / Mock Test intro (remembered per device in localStorage). Hides one wrong answer — the same one for the whole session — and re-letters A–C to match the real HOSA format. The 301 questions with answers like "All of the above" always keep four, because hiding one would break them. Attempts still store the bank's original letter.
* Match drill (Reference → Match drill; `lib/motionMatch.js`, `components/MotionMatch.jsx`): 10 rounds. Each round picks one column of the motions chart (second / debatable / amendable / vote) and five motions whose answers differ; you tap a motion, then its answer. Tiles spell out the chart's shorthand. It drills `data/motions.js` directly, so that chart must stay accurate — its values were checked against each motion's Standard Descriptive Characteristics in RONR 12th ed. on 2026-09-16 (fixes: Commit's debate is limited; Discharge a Committee needs two-thirds or a majority with notice). Local score only. (An earlier "Motion Drill" nav tab on precedence was removed at the user's request.)
* Answer explanations (`data/explanations.js`): shown after answering (and on missed mock-test questions). Each source names the RONR 12th ed. section and paragraph (e.g. §46, 46:6) and states what that passage says in a close, clearly labeled paraphrase — deliberately not quoted, because the book is under copyright and the site is publicly reachable. The PDF has no printed page numbers, so paragraph numbers are the citation. Then a "So:" line tying it to the choices, Dunbar's answer-key letter, and a `conflict` note where the key is shaky under the 12th ed. Covers the 18 questions teammates had missed as of 2026-09-15.
* Admin (`components/Admin.jsx`; nav item shown only to role `admin`; `guru` is the admin): member stats, each member's full answer history / mock tests / flags, and removing members. All of it goes through `admin_members`, `admin_member_history` and `admin_remove_member` — security-definer functions that re-verify the admin's name + PIN through `admin_check`, which clients can't call. The PIN lives in component state only (re-entered each visit). Removal explicitly deletes the member's attempts, flags and exam sessions (their FKs are ON DELETE SET NULL) and refuses to remove yourself or another admin. The client-side role check only hides the nav item; the database is the real gate.
* Flagged Questions: manual star/flag, `F` keyboard shortcut
* Vocabulary: 79 terms, browse (search + filter) and flashcard modes
* Reference: full motions precedence chart (privileged/incidental/subsidiary/main/bring-back classes) + 4-tier study priority list from a frequency analysis of the original Dunbar files
* Team tab: leaderboard with This Week / All-Time toggle. "This Week" resets Friday 12:00 AM US Eastern Time for every viewer regardless of device time zone, DST-aware (see `challengeWeek.js`; no automated tests are checked in — it was verified by hand across both 2026 DST transitions and six device time zones). Everyone sees name + accuracy; captain role additionally gets a per-teammate category-breakdown drill-down.
* Dashboard: overall accuracy/avg time/coverage, accuracy-over-time line chart, day streak, weakest-category callout, recent activity feed
* Settings: account info, the calibration/limitations notes from §4 above, CSV export of personal history, clear-history option
* Keyboard shortcuts: `A`–`D`/`1`–`4` to answer, `Enter` for next, `F` to flag

## 8. Open items / suggested next steps

1. ~~Get actual eyes on the rendered site before making further visual changes.~~ Done 2026-09-15 — run `npm run dev` and look at it; a `.claude/launch.json` is checked in so the preview server starts by name. Always verify visually before claiming a visual change works.
2. ~~Confirm Vercel Deployment Protection is enabled.~~ Settled 2026-09-15 — deliberately left off (§5).
3. If more real questions are wanted: manually download a few Georgia FFA past exams with answer keys (§4) and hand them over for parsing/merging.
4. No code-splitting has been done — the JS bundle is ~1.6MB (~380KB gzipped), mostly the question bank JSON + recharts. Not urgent for a small team tool, but worth knowing if it ever matters.
5. `Practice.jsx` and `App.css` have both grown large through iterative edits (400+ and 1300+ lines respectively) — could benefit from a cleanup pass if picked up for heavier feature work, but nothing broken currently.
