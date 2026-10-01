# Retana UI

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/hero-dark.svg">
    <img src="./.github/assets/hero-light.svg" width="100%" alt="Retana UI is a shadcn registry. Its pieces inherit the host theme and ship none of their own. The specimen shows the layered panel peeking beside a team directory on the same page.">
  </picture>
</p>

A [shadcn/ui](https://ui.shadcn.com) registry by [Eduardo Retana](https://eduardoretana.com). Each piece installs into a host that already has shadcn, uses that host's semantic classes and primitives, and ships no theme of its own.

```bash
npx shadcn@latest add @retana/<name>
```

Catalog demos are written in Spanish. Labels on the pieces are props.

## How a piece stays on the host theme

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/mechanism-dark.svg">
    <img src="./.github/assets/mechanism-light.svg" width="100%" alt="Three steps: the host already has light and dark tokens, install with npx shadcn add @retana/name and keep the host primitives, then the piece reads semantic classes and ships no palette.">
  </picture>
</p>

The catalog can preview items because its own theme lives in `app/globals.css` and `app/layout.tsx`. Nothing under `registry/` imports that theme. `pnpm registry:build` rejects hex colors, `rgb` / `oklch`, Tailwind palette classes, and `cssVars` inside `registry/`.

When the CLI asks to overwrite a primitive the host already has (`button`, `scroll-area`, `sidebar`, and the rest), answer **no**. Only the new item's files should be written.

## Install

The public catalog host is not set. `https://<your-deployment>` below is a placeholder, not a live URL. Deploy this app and use that origin.

`proxy.ts` checks `REGISTRY_TOKEN` first. If it is set, `/r/*` always requires `Authorization: Bearer <token>`, in production and in development, and `REGISTRY_PUBLIC` is ignored. If no token is set, production serves `/r/*` only when `REGISTRY_PUBLIC=true` and otherwise returns 401. Development serves `/r/*` with no token.

To publish the files with no token, unset `REGISTRY_TOKEN` and set `REGISTRY_PUBLIC=true` on the deployment. To gate them, set `REGISTRY_TOKEN` and add the header shown below.

```bash
npx shadcn@latest add https://<your-deployment>/r/<name>.json
```

Register the namespace once in the host `components.json`. Omit `headers` when the deployment is public and no token is set. The shadcn CLI substitutes `${REGISTRY_TOKEN}` from the host's `.env.local`.

```json
{
  "registries": {
    "@retana": {
      "url": "https://<your-deployment>/r/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

```bash
npx shadcn@latest add @retana/layered-panel
```

The same namespace can be registered from the CLI:

```bash
npx shadcn@latest registry add @retana=https://<your-deployment>/r/{name}.json
```

You can also copy the files listed for an item under `registry/`. Fix imports only if your aliases differ. `registry.json` is the source of truth for the catalog index (`/`) and for `/items/[name]`. Install notes for the running catalog are on `/docs`.

This catalog is a Next.js app (App Router) on Tailwind v4 and shadcn's Radix Nova style. The optional URL hook in `layered-panel` is the registry file that imports `next/navigation`. Skip that file if you do not want the query string.

## Catalog

<!-- CATALOG:START -->

`51` items are in `registry.json` on this branch. A name links to its source file.
Run `pnpm readme:catalog` to refresh this list.

Install any registered item with `npx shadcn@latest add @retana/<name>`.

### Detail

- [`layered-panel`](registry/ui/layered-panel.tsx) · block — Right-hand peek panel that expands in place to a two-column detail view. No route change. Optional Next.js URL sync keeps Back working: full collapses to peek, then closes. Ships no theme, cssVars, or global CSS — it uses the host project's shadcn tokens and primitives.

### Chat and agents

- [`chat-message`](registry/ui/chat-message.tsx) · ui — Message bubble for a person or an assistant, with avatar, time, sending and error states, and copy, retry, and regenerate actions.
- [`message-list`](registry/ui/message-list.tsx) · ui — Scroll container that follows new messages until the reader moves up, then offers a control to jump back to the latest one.
- [`chat-composer`](registry/ui/chat-composer.tsx) · ui — Growing textarea that sends on Enter, inserts a newline on Shift+Enter, accepts attachments, swaps in a stop button while generating, and leaves a slot for a model picker.
- [`streaming-text`](registry/ui/streaming-text.tsx) · ui — Renders text as it arrives, with a caret and a short fade-in, and supports basic markdown.
- [`reasoning-steps`](registry/ui/reasoning-steps.tsx) · ui — Collapsible list of reasoning or tool steps with pending, active, done, and error states plus a duration.
- [`task-list`](registry/ui/task-list.tsx) · ui — Agent checklist with a progress bar and optional toggling.
- [`plan-card`](registry/ui/plan-card.tsx) · ui — Card for a proposed plan, with steps and approve, edit, and reject actions.
- [`question-card`](registry/ui/question-card.tsx) · ui — Agent question with single or multiple choices and an optional free-text answer.
- [`inline-citation`](registry/ui/inline-citation.tsx) · ui — Numeric marker that reveals a source title, domain, and excerpt on hover or focus.
- [`code-block`](registry/ui/code-block.tsx) · ui — Code block with token highlighting, a filename, copy, and line numbers.
- [`file-diff`](registry/ui/file-diff.tsx) · ui — Unified diff with added and removed lines, and collapsible runs of unchanged lines.
- [`image-generation`](registry/ui/image-generation.tsx) · ui — Image frame that shows progress and a shimmer while generating, then reveals the result.
- [`ai-document`](registry/ui/ai-document.tsx) · ui — Document where an agent proposes highlighted edits the reader can accept or reject.

### Forms

- [`otp-field`](registry/ui/otp-field.tsx) · ui — One-time code field on the input-otp primitive, with animated success and error states and a resend countdown.
- [`dissolve-input`](registry/ui/dissolve-input.tsx) · ui — Input whose text breaks into fading particles when it is submitted or cleared.
- [`multi-select`](registry/ui/multi-select.tsx) · ui — Multi-select with search, removable chips, and the option to create a new value.
- [`color-picker`](registry/ui/color-picker.tsx) · ui — Accessible color picker with a saturation and brightness field, hue, alpha, and a hex input.
- [`color-palette`](registry/ui/color-palette.tsx) · ui — Grid of color swatches that copy their value on click and confirm it.
- [`magnetic-dropzone`](registry/ui/magnetic-dropzone.tsx) · ui — Drop zone that leans toward the pointer, with a file list, progress, and type and size checks.
- [`gooey-slider`](registry/ui/gooey-slider.tsx) · ui — Slider with an organic trail while dragging, built on the slider primitive.
- [`password-field`](registry/ui/password-field.tsx) · ui — A password field with a reveal control whose slash draws across the eye.
- [`search-field`](registry/ui/search-field.tsx) · ui — A search field with a clear control that returns focus to the input.
- [`segmented-control`](registry/ui/segmented-control.tsx) · ui — A small set of related choices. Arrow keys move the selection and the highlight glides.

### Media and content

- [`video-player`](registry/ui/video-player.tsx) · ui — Video player with custom controls for play, seek, volume, speed, and fullscreen, plus keyboard shortcuts.
- [`lightbox`](registry/ui/lightbox.tsx) · ui — Fullscreen image viewer with next and previous controls, zoom, and keyboard support.
- [`logo-marquee`](registry/ui/logo-marquee.tsx) · ui — Infinite logo row that pauses on hover and fades at the edges.
- [`halftone-image`](registry/ui/halftone-image.tsx) · ui — Image drawn as dots on a canvas that grow toward the pointer.
- [`attachment-chip`](registry/ui/attachment-chip.tsx) · ui — File chip with a type icon, size, optional image preview, and remove.
- [`marker`](registry/ui/marker.tsx) · ui — Animated highlighter mark behind a span of text.
- [`press-sound`](registry/ui/press-sound.tsx) · ui — Hook and wrapper that play a short synthesized click on press, with a shared mute.
- [`text-reveal`](registry/ui/text-reveal.tsx) · ui — Reveals a short line once, word by word, and shows the plain text if motion is reduced.
- [`text-morph`](registry/ui/text-morph.tsx) · ui — Morphs one short label into the next. Shared letters glide and the width follows.
- [`text-shimmer`](registry/ui/text-shimmer.tsx) · ui — A calm light across a short status line while work is ongoing. Sets aria-busy.
- [`in-view-title`](registry/ui/in-view-title.tsx) · ui — A section title that reveals as it scrolls into view: blur, word, line, tracking, or wipe.

### Tables

- [`crm-table`](registry/ui/crm-table.tsx) · ui — CRM-shaped table with avatar and name, a status badge, stage, owner, and last activity. Column helpers match a TanStack column definition so they can be passed to AdminDataTable when that item is installed.

### Admin

- [`admin-utils`](registry/lib/admin-types.ts) · lib — Slug, reorder, CSV, date range, and analytics helpers for an admin that does not care which router or database the host uses.
- [`admin-shell`](registry/ui/admin-shell.tsx) · ui — Collapsible shadcn sidebar, breadcrumbs from one nav config, a command palette, and a theme toggle that uses the host controller when you pass one.
- [`sortable-list`](registry/ui/sortable-list.tsx) · ui — Mouse and keyboard drag list with screen-reader announcements, move buttons, a position number, and optimistic reorder that rolls back.
- [`sortable-board`](registry/ui/sortable-board.tsx) · ui — Project board with category tabs and counts, search, list or grid, a homepage switch per row, and edit.
- [`entity-form`](registry/ui/entity-form.tsx) · ui — Dialog or sheet form for one record, plus confirm-delete, an empty state, and a collapsible section. Submit stays disabled while busy.
- [`settings-form`](registry/ui/settings-form.tsx) · ui — Grouped cards over a string key-value map, with a sticky save bar, discard, and a beforeunload guard.
- [`media-library`](registry/ui/media-library.tsx) · ui — Dropzone field with image and video preview, a library picker, and a grid or table browser. Upload goes through an injected function and blocks submit while it runs.
- [`data-table`](registry/ui/data-table.tsx) · ui — TanStack table for a bookings-style list: tabs, search, filters, sorting, column visibility, multi-select bulk actions, CSV export, and a detail side panel.
- [`admin-charts`](registry/ui/admin-charts.tsx) · ui — KPI card with delta and sparkline, area trend with a range control, funnel, ranked bars, a day-by-hour heatmap, and a scroll-depth chart. Accent colors come from a tone mapped to chart-1…5.
- [`overview-dashboard`](registry/ui/overview-dashboard.tsx) · ui — Composes KPI cards, a trend chart, an upcoming list, and content counts into one overview.
- [`admin-kit`](registry/blocks/admin-kit.tsx) · block — Working admin demo: shell, projects, content lists, settings, media, bookings, and analytics, backed by an in-memory adapter and Spanish sample data.
- [`supabase-admin`](registry/lib/supabase-admin.ts) · lib — Typed adapter for the admin ports. The host passes in @supabase/supabase-js. Includes SQL for content tables, RLS, and a media bucket. This item does not connect to a database.

### Other

- [`dock-nav`](registry/ui/dock-nav.tsx) · ui — Floating pill navigation with pointer magnification, tooltips, an active-route dot, grouped items, and a search item that morphs into a field under the bar.
- [`theme-switch`](registry/ui/theme-switch.tsx) · ui — Four ways to move between light and dark: fade, eclipse, split, and rise. Uses the View Transitions API when the browser has it, and changes the theme immediately otherwise.
- [`copy-button`](registry/ui/copy-button.tsx) · ui — Copies a value and confirms in place, with a drawn check and a live announcement.

<!-- CATALOG:END -->

## One piece, end to end

**Layered panel** opens a peek sheet on the right and can expand in place. The page behind it does not change route, so the table keeps its scroll position.

```tsx
"use client"

import { LayeredPanel } from "@/components/ui/layered-panel"

export function Members({
  open,
  setOpen,
  mode,
  setMode,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  mode: "peek" | "full"
  setMode: (mode: "peek" | "full") => void
}) {
  return (
    <LayeredPanel
      open={open}
      onOpenChange={setOpen}
      mode={mode}
      onModeChange={setMode}
      title="James Carter"
    >
      <LayeredPanel.Peek>Short summary.</LayeredPanel.Peek>
      <LayeredPanel.Full>The long record. The route stays the same.</LayeredPanel.Full>
    </LayeredPanel>
  )
}
```

Props, slots, and the URL hook are in [`registry/ui/layered-panel.tsx`](registry/ui/layered-panel.tsx). `crm-table` can stand alone, or pass `crmColumnDefs()` into `AdminDataTable` when that table is installed.

Some admin-kit list behavior is adapted from [Maniruzzaman Jubayer's MIT admin panel](https://github.com/jubayer910/Admin-panel) and reimplemented on shadcn primitives. That kit is part of this registry. The Supabase adapter includes SQL and does not connect this repo to a database.

## Develop

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

`pnpm registry:build` validates the registry and writes `public/r/*.json`. `pnpm readme:catalog` refreshes the catalog list in this file. New items follow [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE). Copyright (c) 2026 [Eduardo Retana](https://eduardoretana.com).
