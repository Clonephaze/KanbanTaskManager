# Kanban Task Manager — Development Roadmap

Stack: **Nuxt 3 · TypeScript · SCSS · Pinia · VueUse · vue-draggable-plus**  
Full spec → [ChallengeDocs/ChallengeInstructions.md](ChallengeDocs/ChallengeInstructions.md)  
Design system → [ChallengeDocs/DesignGoals/](ChallengeDocs/DesignGoals/) + Figma file  
Architecture → [AGENTS.md](AGENTS.md)

---

## Phase 1 — Project Scaffold

> Goal: a running Nuxt 3 app with all tooling configured and zero placeholder content.

- [x] `npx nuxi init` in project root (or manual scaffold), configure `nuxt.config.ts`
  - `ssr: true` — shell (header, sidebar, layout) renders on server; board/task data is client-only via `<ClientOnly>` or `onMounted` guards
  - Register `@pinia/nuxt` and `@vueuse/nuxt` modules
  - Point global CSS to `assets/styles/main.scss`
  - Configure path aliases (`~/`, `@/`)
- [x] Install dependencies: `pinia`, `@pinia/nuxt`, `@vueuse/nuxt`, `vue-draggable-plus`
- [x] Create `tsconfig.json` with `strict: true`
- [x] Create SCSS partial structure under `assets/styles/`:
  - `_reset.scss` — minimal reset
  - `_tokens.scss` — all CSS custom property tokens (colors, radii, shadows)
  - `_typography.scss` — Google Font import + `@mixin type($variant)`
  - `_mixins.scss` — flex helpers, focus-ring, visually-hidden
  - `main.scss` — `@use` all partials, base `body` styles
- [x] Create `types/index.ts` — `Board`, `Column`, `Task`, `Subtask` interfaces
- [x] Verify dev server boots with `npm run dev`

---

## Phase 2 — Design Tokens & Typography

> Goal: every color, font, radius, and shadow from the Figma design system is a named token. No magic numbers anywhere.

- [x] Fill `_tokens.scss`:
  - All palette values (see `.github/instructions/design-tokens.instructions.md`)
  - `:root` (light theme) + `[data-theme="dark"]` overrides
  - Radius tokens (`--radius-btn-l`, `--radius-card`, `--radius-input`, `--radius-modal`)
  - Shadow token (`--shadow-card`) — verify exact value in Figma
- [x] Fill `_typography.scss`:
  - Import **Plus Jakarta Sans** (weights 500, 700) from Google Fonts via `@import`
  - Implement `@mixin type($variant)` for all 6 scale steps
- [x] Fill `_mixins.scss`:
  - `flex-center`, `flex-between`
  - `focus-ring` (uses `--color-primary`)
  - `visually-hidden`
  - `scrollbar-hidden` (for column task lists)
- [x] Apply `data-theme` attribute via `app.vue` → reads from `useUiStore`
- [x] Smoke-test both themes in browser

---

## Phase 3 — Pinia Stores

> Goal: all state logic is in stores before any UI exists. Stores are testable in isolation.

- [x] `stores/board.ts` — `useBoardStore`
  - State: `boards: Board[]`, `activeBoardIndex: number`
  - Computed: `activeBoard`
  - Actions: `addBoard`, `updateBoard`, `deleteBoard`
  - Actions: `addColumn`, `updateColumn`, `deleteColumn`
  - Actions: `addTask`, `updateTask`, `deleteTask`, `moveTask`
  - Actions: `toggleSubtask`
  - Init: seed from `data.json` if no localStorage key exists
  - Persist: `watch` the entire state and write to localStorage on every change
- [x] `stores/ui.ts` — `useUiStore`
  - State: `theme: 'light' | 'dark'`, `sidebarOpen: boolean`
  - State: `activeModal: null | { type, payload? }`
  - Actions: `toggleTheme`, `toggleSidebar`, `openModal`, `closeModal`
  - Persist: `theme` to localStorage only
- [x] Manual smoke-test in Vue DevTools: seed data loads, mutations update state, localStorage reflects changes

---

## Phase 4 — Base UI Components (`components/ui/`)

> Goal: every form element used anywhere in the app is built once here. No inline duplication ever.

- [x] **`BaseButton.vue`** — props: `variant` (`primary-l` | `primary-s` | `secondary` | `destructive`), `disabled`
  - All four variants + hover states from design system
  - Disabled state: 25% opacity, `cursor: not-allowed`
- [x] **`BaseInput.vue`** — props: `modelValue`, `placeholder`, `error` (string)
  - Idle, active/focus, error states
  - Error message renders right-aligned below input in `--color-danger`
- [x] **`BaseTextarea.vue`** — same prop contract as `BaseInput`, auto-resize or fixed height
- [x] **`BaseDropdown.vue`** — props: `modelValue`, `options: string[]`
  - Idle, open states with chevron icon flip
  - Emits `update:modelValue`
- [x] **`BaseCheckbox.vue`** — props: `modelValue` (boolean), `label`
  - Idle, hovered, completed states (see design system)
  - Uses `icon-check.svg`

---

## Phase 5 — App Shell & Layout

> Goal: the full-page layout is visible with correct proportions, even if content is empty.

- [x] `app.vue` — binds `data-theme` attribute to `useUiStore.theme`, renders `<NuxtPage />`
- [x] `pages/index.vue` — two-column layout: sidebar + main board area
  - Mobile: sidebar hidden by default (slide-in overlay)
  - Tablet/Desktop: sidebar fixed on left
- [x] **`components/board/BoardSidebar.vue`**
  - Logo (`logo-light.svg` / `logo-dark.svg` by theme)
  - Board list — maps `boards` from store, highlights active
  - "Create New Board" button → opens `addBoard` modal
  - Theme toggle (sun/moon icons) → calls `toggleTheme`
  - "Hide Sidebar" button → calls `toggleSidebar`
- [x] **"Show Sidebar" button** — visible in bottom-left when sidebar is hidden (desktop only)
- [x] **App header** (inside `pages/index.vue` or its own component)
  - Active board name (Heading XL)
  - "Add New Task" button (disabled when `activeBoard.columns.length === 0`)
  - Vertical ellipsis menu → Edit Board / Delete Board actions

---

## Phase 6 — Board & Task Display

> Goal: the kanban board is fully readable with real seed data.

- [x] **`components/board/BoardColumn.vue`**
  - Column header: colored dot + column name + task count (Heading S)
  - Task list container (scrollable, hidden scrollbar)
  - Renders `TaskCard` for each task
  - "Add New Column" ghost column at the end → opens `editBoard` modal
- [x] **`components/board/BoardColumnDot.vue`** — colored circle, color assigned by column index from `$column-colors` SCSS list
- [x] **`components/task/TaskCard.vue`**
  - Task title (Heading M)
  - Subtask progress chip: "X of Y subtasks" (Body M, `--color-text-secondary`)
  - Click → opens `viewTask` modal with task payload
  - Hover state: title changes to `--color-primary`
- [x] Empty board state: prompt to "Create New Column" when `activeBoard.columns` is empty
- [x] Empty column state: no special UI needed (just an empty drop zone)

---

## Phase 7 — Modals

> Goal: all CRUD operations work end-to-end. Every modal uses `ModalWrapper` and `ui/` base components.

- [x] **`components/modal/ModalWrapper.vue`**
  - Renders slot content in a centered card over a dark backdrop
  - Click outside → `closeModal`
  - Escape key → `closeModal`
  - Focus trap (VueUse `useFocusTrap`)
  - Entry/exit CSS transition
- [x] **`components/task/TaskDetail.vue`** (viewTask modal)
  - Task title (Heading L), description (Body L)
  - Subtask list using `BaseCheckbox` → calls `toggleSubtask`
  - Status dropdown using `BaseDropdown` → calls `moveTask` on change
  - Ellipsis menu → Edit Task / Delete Task
- [x] **`components/modal/TaskFormModal.vue`** (addTask / editTask)
  - Title input (`BaseInput`), description (`BaseTextarea`)
  - Dynamic subtask list: `BaseInput` per subtask + remove button + "Add New Subtask"
  - Status dropdown (`BaseDropdown`)
  - Form validation: title required, subtask titles required
  - Submit → `addTask` or `updateTask`
- [x] **`components/modal/BoardFormModal.vue`** (addBoard / editBoard)
  - Board name input (`BaseInput`)
  - Dynamic column list: `BaseInput` per column + remove button + "Add New Column"
  - Form validation: board name required, column names required
  - Submit → `addBoard` or `updateBoard`
- [x] **`components/modal/DeleteConfirmModal.vue`**
  - Dynamic title/body copy based on `payload.type` ('board' | 'task')
  - "Delete" (`BaseButton` destructive) + "Cancel" (`BaseButton` secondary)
  - Confirm → `deleteBoard` or `deleteTask`, then `closeModal`

---

## Phase 8 — Drag & Drop

> Goal: tasks can be reordered within a column and moved between columns by dragging.

- [x] Integrate `vue-draggable-plus` into `BoardColumn`
  - Wrap task list in `<VueDraggable>` with `group="tasks"` for cross-column support
  - On `onUpdate` (reorder within column): update task order in store
  - On `onAdd` (moved to new column): call `moveTask`, update `task.status` to new column name
- [x] Visual feedback: dragging card gets a slight shadow/opacity change (`.task-card--dragging`)
- [x] Drag handle: entire card is the drag handle (no separate grip icon)

---

## Phase 9 — Responsiveness & Polish

> Goal: pixel-accurate at all three breakpoints, every hover/focus state implemented.

- [x] **Mobile (≤ 767px)**
  - Sidebar hidden; tap logo area opens sidebar as overlay (semi-transparent backdrop)
  - Mobile header: `logo-mobile.svg`, board name with chevron-down (tapping opens board picker dropdown), `icon-add-task-mobile.svg` button
  - Board columns scroll horizontally
- [x] **Tablet (768-1023px)**
  - Sidebar shown (fixed), narrower than desktop
  - Confirm layout matches Figma tablet spec
- [x] **Desktop (≥ 1024px)**
  - Full sidebar, full header
- [x] Hover states: all buttons, task cards, sidebar board items, checkboxes, inputs
- [x] Focus rings: all interactive elements have visible focus indicator (uses `focus-ring` mixin)
- [x] Scrollbars: column task lists scroll vertically without showing scrollbar (`scrollbar-hidden` mixin)
- [x] Transitions: theme toggle (color transition on body), modal enter/leave, sidebar show/hide

---

## Phase 10 — Final QA

> Goal: all user stories from the spec pass, no regressions.

- [x] Walk through every bullet in [ChallengeDocs/ChallengeInstructions.md](ChallengeDocs/ChallengeInstructions.md) "Expected Behaviour"
- [x] Refresh browser — data persists, theme persists, sidebar state resets
- [x] Create a new board, add columns, add tasks with subtasks — full happy path
- [x] Edit board name + columns (add, rename, remove)
- [x] Delete board (confirm prompt, then board is gone)
- [x] Edit task: change title, description, subtasks, status → task moves to new column
- [x] Delete task (confirm prompt)
- [x] Toggle all subtasks on a task → count updates live
- [x] Change task status via dropdown in `TaskDetail` → task moves to new column
- [x] Drag task between columns → status updates to match destination column
- [x] Drag to reorder within a column → order persists after refresh
- [x] "Add New Task" disabled when board has no columns
- [x] "Add New Column" on empty board → opens edit board modal
- [x] Light ↔ dark toggle, all components look correct in both themes
- [x] All form validations fire correctly (empty title, empty column name, etc.)
- [x] Keyboard navigation: modals trap focus, Escape closes, Tab cycles correctly
- [x] Cross-browser smoke test (Chrome, Firefox, Safari/Edge)

---

## Milestone Summary

| Phase | Deliverable | Key files |
|---|---|---|
| 1 | Scaffold | `nuxt.config.ts`, `assets/styles/`, `types/index.ts` |
| 2 | Design tokens | `_tokens.scss`, `_typography.scss`, `_mixins.scss` |
| 3 | State layer | `stores/board.ts`, `stores/ui.ts` |
| 4 | UI primitives | `components/ui/Base*.vue` |
| 5 | App shell | `app.vue`, `pages/index.vue`, `BoardSidebar` |
| 6 | Board display | `BoardColumn`, `TaskCard` |
| 7 | All modals | `ModalWrapper`, `TaskDetail`, `TaskFormModal`, `BoardFormModal`, `DeleteConfirmModal` |
| 8 | Drag & drop | `vue-draggable-plus` integration |
| 9 | Responsive + polish | Breakpoints, transitions, hover/focus states |
| 10 | Final QA | All spec bullets checked |
