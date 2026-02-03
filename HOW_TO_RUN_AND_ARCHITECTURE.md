# How to Run AutoVibe & How Each Piece Works

## Part 1: How to Run the Program

### Prerequisites

- **Node.js 18+** (check: `node -v`)
- **npm** (comes with Node)
- **Supabase account** (free at [supabase.com](https://supabase.com))
- **Moonshot AI API key** ([platform.moonshot.cn](https://platform.moonshot.cn/))

### Step 1: Install dependencies

From the **my-app** folder (the Next.js app lives here):

```bash
cd /Users/master/Vibe/my-app
npm install
```

### Step 2: Environment variables

Create a file named `.env.local` in **my-app** (same folder as `package.json`):

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
MOONSHOT_API_KEY=your-moonshot-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

- Get **Supabase URL** and **anon key** from: Supabase Dashboard → Project Settings → API.
- Get **Moonshot API key** from the Moonshot platform.
- Use **3001** in `NEXT_PUBLIC_APP_URL` if you run on port 3001 (see below).

### Step 3: Database (Supabase)

1. In Supabase Dashboard → **SQL Editor**, create a new query.
2. Copy the full contents of **my-app/supabase/migrations/001_initial_schema.sql**.
3. Run the query.

This creates the tables (`profiles`, `social_accounts`, `content_ideas`, `generated_posts`) and Row Level Security (RLS) policies.

### Step 4: Start the dev server

Always run from **my-app**:

```bash
cd /Users/master/Vibe/my-app
npm run dev -- -p 3001
```

- App: **http://localhost:3001**
- If you see “Unable to acquire lock”, remove the lock and try again:
  ```bash
  rm .next/dev/lock
  npm run dev -- -p 3001
  ```

### Step 5: Use the app

1. Open **http://localhost:3001**.
2. Click **Start Free Trial** or **Sign In**.
3. Sign up (or log in).
4. You’ll be redirected to the dashboard. Use **Generate** to create content.

---

## Part 2: How Each Piece Works

### High-level flow

```
Browser → Next.js (pages + API) → Supabase (auth + DB) & Moonshot AI
```

- **Pages** render the UI and link to login, dashboard, generate, history, settings.
- **Middleware** runs on every request: it checks the session and redirects (e.g. unauthenticated users away from dashboard).
- **API routes** handle actions (e.g. POST /api/generate) and talk to Supabase and Moonshot.
- **Supabase** handles auth (login/signup) and stores profiles, ideas, and generated posts.
- **Moonshot AI** generates the post text (and image prompts) per platform.

---

### 1. Entry point and routing

| Path | What it is | What it does |
|------|------------|--------------|
| `app/page.tsx` | Root page | Landing page (hero, features). Links to `/login` and `/signup`. |
| `app/layout.tsx` | Root layout | Wraps the whole app (fonts, global styles). |
| `app/globals.css` | Global CSS | Tailwind + theme variables (colors, radius, dark mode). |

**Next.js App Router**:

- `app/(auth)/` — route group for auth: login, signup, callback (no sidebar).
- `app/(dashboard)/` — route group for app: dashboard, generate, history, settings (with sidebar).
- `app/api/` — API routes (e.g. `/api/generate`, `/api/auth/.../callback`).

So: **`app/(dashboard)/generate/page.tsx`** → URL **/generate**; **`app/api/generate/route.ts`** → **POST /api/generate**.

---

### 2. Middleware (`middleware.ts`)

Runs **before** every request (except static assets).

1. Creates a **Supabase server client** using cookies from the request.
2. Calls **`supabase.auth.getUser()`** to get the current user from the session.
3. **Protection rules:**
   - If the path is `/dashboard`, `/generate`, `/history`, or `/settings` and there is **no** user → redirect to **/login**.
   - If the path is **/login** or **/signup** and there **is** a user → redirect to **/dashboard**.
4. Returns the response (often unchanged) so the request continues to the page or API.

So: **middleware** = gatekeeper for “must be logged in” and “don’t show login when already logged in”.

---

### 3. Auth: login, signup, session

| File / area | Role |
|-------------|------|
| `app/(auth)/login/page.tsx` | Login form; calls Supabase Auth to sign in. |
| `app/(auth)/signup/page.tsx` | Signup form; calls Supabase Auth to create user. |
| `app/(auth)/callback/page.tsx` | Handles redirects after email confirmation (e.g. magic link). |
| `lib/supabase/client.ts` | Browser Supabase client (used on login/signup pages). |
| `lib/supabase/server.ts` | Server Supabase client (used in API routes and server components); reads cookies. |

Flow:

1. User submits email/password on login or signup.
2. The page uses the **client** Supabase to call `signInWithPassword` or `signUp`.
3. Supabase sets **session cookies**.
4. On the next request, **middleware** and **server** code use those cookies via `getUser()` / `createClient()` so they know who is logged in.

---

### 4. Dashboard area (layout + pages)

| File | Role |
|------|------|
| `app/(dashboard)/layout.tsx` | Wraps all dashboard routes; renders **Sidebar** + main content. |
| `components/dashboard/Sidebar.tsx` | Navigation (Dashboard, Generate, History, Settings) and logout. |
| `app/(dashboard)/dashboard/page.tsx` | Dashboard home: stats, recent ideas, connected accounts. |
| `app/(dashboard)/generate/page.tsx` | Generate page: renders **GenerateForm** (idea, niche, platforms). |
| `app/(dashboard)/history/page.tsx` | History page: list of past ideas and generated posts. |
| `app/(dashboard)/settings/page.tsx` | Settings: account connections (OAuth placeholders). |

Only **authenticated** users reach these pages because **middleware** redirects others to `/login`.

---

### 5. Content generation flow (the main feature)

**User side:**

1. User opens **/generate**.
2. Fills **GenerateForm** (idea text, niche, selected platforms).
3. Submits the form.

**Client (GenerateForm):**

- Sends **POST /api/generate** with `{ idea, niche, platforms }`.
- Receives `{ posts }` (one per platform) and shows them in **GeneratedPosts** (copy, edit, etc.).

**Server: `/api/generate` (`app/api/generate/route.ts`)**

1. **Auth:** Creates Supabase server client, calls `getUser()`. If no user → `401 Unauthorized`.
2. **Validate body:** Needs `idea`, `niche`, and at least one `platform`. Otherwise → `400`.
3. **Save idea:** Inserts into `content_ideas` (user_id, idea, niche). If DB fails, continues with an in-memory id so generation still works.
4. **For each platform** (e.g. Twitter, Instagram, Facebook, YouTube):
   - Builds a **platform-specific prompt** via `createPlatformPrompt()` (from `lib/moonshot.ts`).
   - Calls **`generateContent()`** (Moonshot API) to get the post text.
   - If Moonshot fails, uses **`generateMockContent()`** so the UI still gets something.
   - Optionally generates an **image prompt** via another Moonshot call.
   - Extracts hashtags, cleans content, then inserts into **`generated_posts`** (idea_id, platform, content, hashtags, image_prompt, status).
5. Returns **`{ posts }`** to the client.

So: **API route** = “ensure user, save idea, call Moonshot per platform, save posts, return results”.

---

### 6. Moonshot AI (`lib/moonshot.ts`)

| Function / concept | Role |
|--------------------|------|
| `generateContent(messages)` | Sends a chat request to Moonshot API; returns the assistant’s text. Used for post text and image prompts. |
| `createPlatformPrompt(platform, niche, idea, platformInstructions)` | Builds `system` + `user` messages so the model writes platform-appropriate content (e.g. Twitter vs Instagram). |
| `generateMockContent(platform, niche, idea)` | Fallback when `MOONSHOT_API_KEY` is missing or the API fails; returns example text so the app still works. |

**Types** in `types/index.ts` (e.g. `PLATFORM_PROMPTS`) define the instructions per platform. Moonshot is called only from the **server** (API route), so the API key stays in `.env.local` and is never exposed to the browser.

---

### 7. Database (Supabase)

**Tables (from `supabase/migrations/001_initial_schema.sql`):**

- **profiles** — one per user (id, display name, etc.); often created by a trigger on `auth.users`.
- **social_accounts** — connected social accounts (platform, tokens, etc.); used for future “post to X” and OAuth.
- **content_ideas** — user’s idea text + niche; links to `user_id`.
- **generated_posts** — one row per generated post: platform, content, hashtags, image_prompt, status; links to `content_ideas`.

**Who talks to the DB:**

- **Server only:** `createClient()` from `lib/supabase/server.ts` (used in API routes and server components). Uses cookies so Supabase can enforce **Row Level Security (RLS)** per user.

---

### 8. OAuth (social account connections)

- **Routes:** `app/api/auth/facebook/callback/route.ts` (and instagram, twitter, youtube).
- **Purpose:** After the user authorizes the app on the platform, the platform redirects to these URLs with a code; the route should exchange the code for tokens and store them in **social_accounts**.
- **Status:** Callback routes exist but **token exchange is not fully implemented**; they are stubs. The UI (e.g. “Connect Facebook”) is there; wiring real posting/scheduling would come later.

---

### 9. Quick reference: “Where is X?”

| What | Where |
|------|--------|
| Run the app | `cd my-app` then `npm run dev -- -p 3001` |
| Env vars | `my-app/.env.local` |
| DB schema | `my-app/supabase/migrations/001_initial_schema.sql` |
| “Must be logged in” logic | `middleware.ts` |
| Login/signup UI | `app/(auth)/login/page.tsx`, `signup/page.tsx` |
| Dashboard + sidebar | `app/(dashboard)/layout.tsx`, `Sidebar.tsx` |
| Generate form + results | `app/(dashboard)/generate/page.tsx`, `GenerateForm.tsx`, `GeneratedPosts.tsx` |
| “Generate” API | `app/api/generate/route.ts` |
| AI calls | `lib/moonshot.ts` |
| Supabase (server) | `lib/supabase/server.ts` |
| Shared types / platform prompts | `types/index.ts` |

---

## Summary

- **Run:** Install deps in `my-app`, add `.env.local`, run SQL migration in Supabase, then `npm run dev -- -p 3001` from `my-app`.
- **Flow:** User hits Next.js → middleware checks session → pages render; generate form POSTs to `/api/generate` → API uses Supabase (auth + DB) and Moonshot (AI), then returns generated posts to the client.

Once this is clear, you can change behavior by editing the right piece (e.g. prompts in `types/index.ts`, generation logic in `app/api/generate/route.ts`, or UI in `GenerateForm.tsx`).
