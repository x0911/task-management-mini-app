# Task Manager — Nuxt 3 Mini App

[![Core Web Vitals](../../actions/workflows/lighthouse.yml/badge.svg)](../../actions/workflows/lighthouse.yml)

A small, fast task management app built with Nuxt 3 (Composition API + TypeScript), Pinia, and Tailwind CSS. Nuxt serves both the frontend and a JSON-file-backed REST API, so there's nothing else to stand up.

---

## 1. Node.js and npm versions

This project was developed using **Node.js v25.6.1** and **npm 11.9.0**.

> Older supported versions (such as Node 18 and 20) are expected to work correctly, even though development was done on newer versions.

Check your version:

```bash
node -v
npm -v
```

## 2. Setup

```bash
npm install
```

This also runs `nuxt prepare` automatically (via `postinstall`), which generates the `.nuxt` type helpers.

## 3. Running in development

```bash
npm run dev
```

The app runs at **http://localhost:3000**. Task data lives in `data/tasks.json` and is seeded with 3 example tasks the first time you run it. Feel free to edit or delete that file to reset the demo data; an empty or missing file is treated as zero tasks and won't crash the app.

## 4. Running a production build locally

```bash
npm run build
node .output/server/index.mjs
```

Or, to preview via Nuxt's own preview command:

```bash
npm run preview
```

## 5. Running tests

```bash
npm run test          # single run
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

Test coverage is split across 9 files:
- **`tests/unit/validateTask.spec.ts`**: server-side validation (create + partial/update modes)
- **`tests/unit/db.spec.ts`**: the JSON-file task repository (CRUD, missing-id handling, concurrent-write safety)
- **`tests/unit/tasksStore.spec.ts`**: the Pinia store (fetch/create/update/delete, filtering, search, counts, error handling)
- **`tests/unit/useTaskForm.spec.ts`** and **`useDebouncedValue.spec.ts`**: composables
- **`tests/components/*.spec.ts`**: `TaskForm`, `TaskCard`, `StatusBadge`, `ConfirmDialog` component behavior

## 6. Linting & type-checking

```bash
npm run lint
npm run typecheck
```

---

## Project structure

```
├── assets/css/main.css        Design tokens & Tailwind layer utilities
├── components/                Reusable Vue components (all script setup + TS)
├── composables/                useDebouncedValue, useTaskForm
├── data/tasks.json            The "database": a flat JSON file
├── pages/                      index.vue (list) and tasks/[id].vue (detail/edit)
├── server/api/tasks/          REST endpoints (GET/POST/PUT/DELETE), Nitro
├── server/utils/              db.ts (file repository), validateTask.ts
├── stores/tasks.ts            Pinia store, single source of truth on the client
├── tests/                      Vitest unit + component tests
├── types/task.ts               Shared Task/TaskInput/TaskStatus types
└── .github/workflows/lighthouse.yml   CI performance gate
```

## How data storage works

All requests go through Nitro's server routes (`server/api/tasks/*.ts`), which read and write `data/tasks.json` through `server/utils/db.ts`. Writes are serialized through an internal promise queue so two nearly-simultaneous requests can't corrupt the file. There's no database by design, so **anyone using the app shares the same file and sees the same tasks**. That's fine for demo purposes; it won't scale to concurrent production traffic.

## API reference

| Method | Path              | Body                                             | Notes                                  |
|--------|-------------------|---------------------------------------------------|-----------------------------------------|
| GET    | `/api/tasks`      | —                                                 | Returns all tasks, newest first         |
| GET    | `/api/tasks/:id`  | —                                                 | 404 if not found                        |
| POST   | `/api/tasks`      | `{ title, description, status, dueDate }`         | 422 on validation failure; due date must be in the future |
| PUT    | `/api/tasks/:id`  | Any subset of the fields above                    | Partial update; due date isn't required to be in the future (see below) |
| DELETE | `/api/tasks/:id`  | —                                                 | 204 on success, 404 if not found        |

## UX notes

- **Typography**: the system font stack (`ui-sans-serif`, `-apple-system`, `Segoe UI`, etc.) is used instead of a webfont. Zero extra font network requests, no layout shift while a font loads, which helps Core Web Vitals (no font-swap CLS, faster LCP).
- **Signature element**: the small 3-segment "stage tracker" bar on each task card and the detail page encodes the actual workflow position (Pending → In Progress → Done) instead of just repeating the status pill. It's a second, at-a-glance way to scan task state across a grid.
- **All dialogs are custom** (`BaseModal.vue`, `ConfirmDialog.vue`). No `window.confirm`/`alert`; built with `<Teleport>`, focus-safe close on `Escape` and backdrop click, and `role="dialog"`/`aria-modal` for accessibility.
- **Responsive**: task grid is 1 column on mobile, 2 on tablet, 3 on desktop (`sm:grid-cols-2 xl:grid-cols-3`). Filters stack vertically on narrow screens and go inline on wider ones. The modal and detail page cap width and scroll internally so nothing overflows on small viewports.

---

## Core Web Vitals / Lighthouse CI gate

`.github/workflows/lighthouse.yml` runs on every push to `main`:

1. Installs dependencies and runs the full Vitest suite.
2. Builds the app for production (`npm run build`).
3. Boots the built server (`node .output/server/index.mjs`).
4. Runs `@lhci/cli` against `lighthouserc.json`, which asserts `categories:performance` must score **≥ 0.85** (85%) on both the task list and a task detail page, across 3 runs (LHCI takes the median automatically).
5. If the score drops below 85%, `lhci autorun` exits non-zero and the workflow fails the build. That's LHCI's built-in assertion behavior; no extra scripting needed.

To run the same check locally:

```bash
npm run build
node .output/server/index.mjs &
npx @lhci/cli@0.14.x autorun --config=./lighthouserc.json
```

<!-- LIGHTHOUSE_RESULTS_START -->
### Latest Lighthouse scores

_This section is updated automatically by CI on every push to `main`.

<!-- LIGHTHOUSE_RESULTS_END -->

The two full HTML report links each run generates (`storage.googleapis.com/...report.html`) are temporary and expire after about a week — that's a `temporary-public-storage` limitation of Lighthouse CI itself, not something this repo can control. The table above is the permanent record; click through to a report link while it's fresh if you want the full trace/waterfall view, or check the [latest workflow run](../../actions/workflows/lighthouse.yml) directly for the current pair of links.

## Known limitations (by design)

- Single shared JSON file means a single shared task list for every visitor; no auth, no per-user data.
- No real-time updates between open tabs/clients. Refresh or re-navigate to see another session's changes.
- No pagination, which is fine at demo scale.