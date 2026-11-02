# StudyVerse

StudyVerse is an AI-assisted learning platform for Moroccan students (primary, collège and lycée). It is built incrementally: this repository currently contains **Phase 0 — foundations** only.

Phase 0 delivers the product shell, design system, internationalisation (French, Modern Standard Arabic and Moroccan Darija), RTL support, dark/light themes, a PWA offline shell, Supabase authentication plumbing, the initial profile schema with Row Level Security, and the automated test foundation.

![status](https://img.shields.io/badge/phase-0%20foundations-6D5EF8)

## Stack

- **Frontend:** React 19, TypeScript 5.9, Vite 7, React Router 7
- **Styling:** Tailwind CSS 3.4 with semantic CSS-variable tokens, Framer Motion, Lucide, Radix Dialog/Tabs
- **Data:** TanStack Query 5, Supabase (Postgres, Auth, RLS)
- **Forms & validation:** React Hook Form, Zod
- **i18n:** i18next / react-i18next with `fr`, `ar` and `dar`; full RTL and Arabic-friendly fonts
- **PWA:** vite-plugin-pwa / Workbox
- **Testing:** Vitest + React Testing Library, Playwright (Chromium desktop + Pixel 7)
- **Quality:** ESLint 9 flat config, Prettier, GitHub Actions CI

## Requirements

- Node.js >= 22.12 (CI uses Node 24)
- npm
- A Supabase project (optional for UI work — the app degrades gracefully when unconfigured)

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project values
npm run dev
```

Without `.env.local`, the marketing pages, theme and language switching still work. The auth screens show a clear "configuration missing" state instead of pretending to sign in.

### Environment variables

Only browser-safe values belong in `.env.local`:

| Variable                 | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL                      |
| `VITE_SUPABASE_ANON_KEY` | Anon / publishable key (protected by RLS) |

**Never** put the `service_role` key or an AI provider key in any `VITE_*` variable. Those are server secrets and belong only in Supabase Edge Function secrets in later phases. `.env.example` documents the contract and `.gitignore` excludes every `.env*` file except the example.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase/migrations/20261102090000_initial_profiles.sql`](supabase/migrations/20261102090000_initial_profiles.sql). It creates:
   - `public.user_role` (`student`, `parent`, `teacher`, `admin`) and `public.app_language` (`fr`, `ar`, `dar`)
   - `public.profiles` with RLS enabled
   - select/update policies restricted to the authenticated user's own row
   - column-level grants that exclude `role`, preventing self-service privilege escalation
   - a security-definer trigger that creates a profile for every new `auth.users` row
3. In **Authentication → URL Configuration**, set the site URL and add `http://localhost:5173/auth/callback` (plus your production callback) as a redirect URL.
4. Copy the project URL and anon key into `.env.local`, then restart the dev server.

If you use the Supabase CLI, `supabase db push` applies the same migration. This environment did not have the CLI or a database connection, so **the migration has not been executed against a live project**; see [Limitations](#limitations).

### RLS tests

[`supabase/tests/profiles_rls.sql`](supabase/tests/profiles_rls.sql) contains nine pgTAP assertions covering profile creation, own-row access, blocked role escalation, cross-user access denial and anonymous access denial.

```bash
# with the Supabase CLI, against a linked local/project database
supabase test db
```

They have not been executed here because no Postgres/Supabase runtime is available in this environment.

## Scripts

| Command                           | Description                                           |
| --------------------------------- | ----------------------------------------------------- |
| `npm run dev`                     | Start the Vite dev server                             |
| `npm run build`                   | Type-check (`tsc -b`) and build the PWA               |
| `npm run preview`                 | Serve the production build                            |
| `npm run typecheck`               | TypeScript project build, no emit                     |
| `npm run lint`                    | ESLint with zero warnings allowed                     |
| `npm run test`                    | Vitest unit/integration suite                         |
| `npm run test:watch`              | Vitest in watch mode                                  |
| `npm run test:e2e`                | Playwright smoke tests (starts its own server)        |
| `npm run icons`                   | Regenerate PWA PNG icons from `public/brand/icon.svg` |
| `npm run format` / `format:check` | Prettier                                              |

## What works in Phase 0

- Responsive marketing landing page in French, Arabic and Darija, with RTL, 44px targets, visible focus and reduced-motion handling.
- Dark-first theme with a persisted light theme; the choice is applied before paint to avoid flashes.
- Sign-up, sign-in, email-confirmation callback and sign-out against Supabase Auth with PKCE.
- Validated forms in all three languages, with translated server-error mapping and re-validation when the language changes.
- Protected `/account` route showing the signed-in user's profile from Postgres, with loading, error and empty states.
- Privacy notice page (draft) and a real 404 page.
- Offline banner, installable PWA with generated icons and a precached app shell.
- Initial migration with RLS, column-level grants and a profile-creation trigger.
- Unit tests, Playwright smoke tests and CI.

## What is not built yet

Phase 0 intentionally contains **no fake features**:

- No onboarding, guardian consent, parent links, teacher or admin surfaces (Phase 1+).
- No dashboard, AI teacher, quiz center, planner or gamification (Phases 2–6).
- No AI calls, Edge Functions, file uploads or storage buckets yet.
- Offline caching currently covers the app shell only, not flashcards or planner data (those features arrive later).
- No demo lessons or questions are seeded yet. When they are added they will be original content labelled **DEMO DATA**, never presented as official curriculum.

Unknown routes show the 404 page. Future modules will be labelled "Coming soon" behind feature flags rather than rendered as mock functionality.

## Project structure

```
src/
  app/          # App composition, providers, router, error boundary
  components/   # Reusable layout, brand and UI kit components
  features/     # Feature modules (auth, preferences, profile)
  lib/          # Supabase client, env validation, i18n, formatting, storage
  pages/        # Route-level pages
  styles/       # Tailwind entry point and design tokens
  types/        # Database types
supabase/
  migrations/   # Versioned SQL
  tests/        # pgTAP RLS tests
tests/e2e/      # Playwright smoke tests
docs/           # Privacy-by-design documentation
```

## Manual verification checklist

1. `npm run dev`, then open `http://localhost:5173`.
2. Switch language between Français, العربية and الدارجة — the layout flips to RTL for Arabic and the copy for forms changes.
3. Toggle the theme; reload and confirm the choice persists without a flash.
4. Resize to a mobile viewport and check navigation, focus states and tap targets.
5. With Supabase configured: create an account, confirm the email, sign in, open **Mon espace**, then sign out. Sign-out returns to the home page with a success toast.
6. Visit `/privacy` and an unknown URL (`/nope`).
7. Run the production build with `npm run build && npm run preview`; check the offline banner by switching the network offline in DevTools.

## Privacy and security

- RLS is enabled on every table. Students can read/update only their own profile; the `role` column is not grantable to clients.
- The anon key is the only Supabase key in the browser. Service-role and AI keys are reserved for server secrets.
- Private storage buckets, short-lived signed URLs and MIME allowlists are the planned contract for Phase 3; they are not implemented yet.
- The privacy notice is a **draft** and makes no claim of legal compliance. See [docs/privacy-by-design.md](docs/privacy-by-design.md) for the data inventory, proposed retention, open questions and the items that require review by a qualified Moroccan legal professional (Law 09-08 / CNDP).

## Deployment

`vercel.json` configures SPA rewrites and a Content-Security-Policy restricted to the app origin plus the Supabase project. Set the two public environment variables in the hosting provider; never add server secrets to the frontend environment.

## Phase roadmap

| Phase | Scope                                                       | Status   |
| ----- | ----------------------------------------------------------- | -------- |
| 0     | Foundations, auth shell, design system, profile schema, PWA | Complete |
| 1     | Accounts onboarding, guardian consent, roles                | Next     |
| 2     | Student dashboard                                           | Planned  |
| 3     | AI Teacher (streaming, safety, moderation, images)          | Planned  |
| 4     | Quiz center with server-side scoring                        | Planned  |
| 5     | Revision planner                                            | Planned  |
| 6     | Gamification with documented rules                          | Planned  |
| 7     | Modular "Coming soon" stubs behind feature flags            | Planned  |

MVP is Phases 0–6.

## Limitations

- The SQL migration and pgTAP suite were authored but not executed; verify them against a disposable Supabase project before relying on them.
- The account page was verified with mocked Supabase REST/auth responses; a real end-to-end sign-up/sign-in flow requires a provisioned project.
- No legal review has been performed on the privacy notice or this documentation.
- Curriculum sources, licences and validation status are not yet modelled; no curriculum content is included.
