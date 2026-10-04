# Retana UI

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/hero-dark.svg">
    <img src="./.github/assets/hero-light.svg" width="100%" alt="Retana UI is a shadcn registry. Its pieces inherit the host theme and ship none of their own. The specimen shows the layered panel peeking beside a team directory on the same page.">
  </picture>
</p>

A [shadcn/ui](https://ui.shadcn.com) registry by [Eduardo Retana](https://eduardoretana.com). Each piece installs into a host that already has shadcn, uses that host's semantic classes and primitives, and ships no theme of its own. Dark mode comes from the host.

Catalog demos are written in Spanish. Labels on the pieces are props.

## What's in the catalog

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/families-dark.svg">
    <img src="./.github/assets/families-light.svg" width="100%" alt="Three catalog families. Arc UI free-tier charts, blocks, and inputs stay on host tokens. An icon rail, a folding table, and room presence. One collection shown through table, board, and month views, with calendar, timeline, list, and gallery beside them.">
  </picture>
</p>

The index at the bottom is generated from `registry.json`. These three groups are the newest.

**Arc UI free tier.** Charts, page blocks, inputs, and actions adapted from [Arc UI](https://github.com/kuratlielia/arc-library) by Elia Kuratli (MIT). This registry includes the free tier. Adapted motion depends on the `motion` package and is skipped when the reader prefers reduced motion. A few older pieces gained optional behaviors from that same tier: reactions on `chat-message`, line collapse on `code-block`, swatches and EyeDropper on `color-picker`, chip overflow on `multi-select`, upload progress on `magnetic-dropzone`, pause and play on `logo-marquee`, and focus options on `otp-field`.

**Rail, adaptive table, and presence.** `rail-sidebar` is an icon rail plus a section panel, built on the host sidebar. `adaptive-table` drops, folds, and stretches columns to the container width. The presence kit is `presence`, `presence-liveblocks`, `presence-supabase`, `presence-avatars`, `live-cursors`, `typing-indicator`, and `presence-outline`. UI pieces read one provider, so the same avatars and cursors work with the in-memory adapter, Liveblocks, or Supabase Realtime. Liveblocks wiring uses the Apache-2.0 client packages. Setup notes ship in [`registry/lib/presence/README.md`](registry/lib/presence/README.md).

**Multi-view.** `multi-view` shows one collection as `view-table`, `view-kanban`, `view-calendar`, `view-timeline`, `view-grouped-list`, and `view-gallery`, with `record-properties` in the record panel. `multi-view-core` and `use-multi-view` hold the field schema and the view state. Pass records in. Saves go through host callbacks and roll back when a callback rejects. Wiring for Supabase and a plain REST API is in [`registry/lib/multi-view/README.md`](registry/lib/multi-view/README.md).

**Layouts.** [`magnetic-bento`](registry/ui/magnetic-bento.tsx) is a bento grid with one shared highlight. The active card sets `anchor-name` and the highlight uses `position-anchor` with `inset: anchor(inside)`, so the four edges stretch between cards of different sizes. Browsers where `CSS.supports("anchor-name: --x")` is false measure the active card instead. The technique idea is from [jh3yy](https://x.com/jh3yy/status/2105823926978814273). The cards in this registry are original.

**Verification and notices.** [`two-factor-card`](registry/ui/two-factor-card.tsx) is a one-time-code card on the `input-otp` primitive: countdown, verify, alternate methods, and a success handoff. [`otp-field`](registry/ui/otp-field.tsx) is the field alone when the screen already has its own frame. [`notification-stack`](registry/ui/notification-stack.tsx) is a depth stack that advances when the front card is dismissed. [`toast-stack`](registry/ui/toast-stack.tsx) is for short results at the edge, [`notification-center`](registry/blocks/notification-center.tsx) keeps a grouped list with read state, and [`card-stack`](registry/ui/card-stack.tsx) is a left-or-right triage deck. The two new cards take visual inspiration from Design & Code With AV Facebook reels. No code from those reels was used.

## How a piece stays on the host theme

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/mechanism-dark.svg">
    <img src="./.github/assets/mechanism-light.svg" width="100%" alt="Three steps: the host already has light and dark tokens, install with npx shadcn add @retana/name and keep the host primitives, then the piece reads semantic classes and ships no palette.">
  </picture>
</p>

The catalog can preview items because its own theme lives in `app/globals.css` and `app/layout.tsx`. Nothing under `registry/` imports that theme. `pnpm registry:build` rejects hex colors, `rgb` / `oklch`, Tailwind palette classes, and `cssVars` inside `registry/`.

When the CLI asks to overwrite a primitive the host already has (`button`, `scroll-area`, `sidebar`, and the rest), answer **no**. Only the new item's files should be written.

## Which piece should I use

Names that sit near each other do different jobs. Install the row that matches the screen.

### Tables

| Piece | Use it for |
| --- | --- |
| [`data-table`](registry/ui/data-table.tsx) | A bookings-style admin list: tabs, search, filters, sorting, column visibility, multi-select bulk actions, CSV export, and a detail side panel. |
| [`crm-table`](registry/ui/crm-table.tsx) | A fixed contact layout: avatar and name, status, stage, owner, and last activity. `crmColumnDefs()` can be passed to `AdminDataTable` when `data-table` is installed. |
| [`adaptive-table`](registry/ui/adaptive-table.tsx) | A grouped table in a narrow panel. Columns declare a priority, drop when the container is tight, and fold into a neighbor. |
| [`view-table`](registry/ui/view-table.tsx) | Rows from a field schema, with checkbox selection and per-type cells, when those same rows also appear in the other views. |

`view-grouped-list` is collapsible groups of compact rows, including a progress ring. `view-gallery` is cards with an optional cover and quick filter chips. `view-calendar` is a month grid for one date field.

### Boards

| Piece | Use it for |
| --- | --- |
| [`sortable-board`](registry/ui/sortable-board.tsx) | The homepage project board: category tabs and counts, search, list or grid, and a homepage switch per row. |
| [`view-kanban`](registry/ui/view-kanban.tsx) | Status or select columns over a field schema, with counts, sums, drag, a keyboard sensor, and a Move to menu. |

### Time

| Piece | Use it for |
| --- | --- |
| [`timeline`](registry/ui/timeline.tsx) | An activity feed, newest first, grouped by day. |
| [`view-timeline`](registry/ui/view-timeline.tsx) | A horizontal schedule with a start and an end, zoom, a today line, and keyboard move or resize. |

### Editing a record

| Piece | Use it for |
| --- | --- |
| [`inline-edit`](registry/ui/inline-edit.tsx) | One string in place. The text becomes a field without moving. |
| [`record-properties`](registry/ui/record-properties.tsx) | A whole schema of property rows, including inside `layered-panel`. Enter commits. Escape cancels. |

### People

| Piece | Use it for |
| --- | --- |
| [`avatar-group`](registry/ui/avatar-group.tsx) | A static stack of people, with an overflow count. |
| [`presence-avatars`](registry/ui/presence-avatars.tsx) | People currently in a presence room, with a live dot, tooltips, and an optional single avatar for every agent. It reads `PresenceProvider`. |

### Layouts

| Piece | Use it for |
| --- | --- |
| [`magnetic-bento`](registry/ui/magnetic-bento.tsx) | Mixed column and row spans with one highlight that glides between cards. Hover, focus, and tap move it, and it stays on the last card. |
| [`blog-grid`](registry/blocks/blog-grid.tsx) | A page of posts. |
| [`card-stack`](registry/ui/card-stack.tsx) | A triage deck you flick left or right. For notices in a depth stack, use `notification-stack`. |
| [`radio-cards`](registry/ui/radio-cards.tsx) | One choice among option cards, with arrow keys. |
| [`view-gallery`](registry/ui/view-gallery.tsx) | Schema records as cards, inside multi-view. |

### Verification

| Piece | Use it for |
| --- | --- |
| [`otp-field`](registry/ui/otp-field.tsx) | The code field alone: digits, an error, a success line, and a resend cooldown. |
| [`two-factor-card`](registry/ui/two-factor-card.tsx) | The whole verification card: countdown, verify, alternate methods, and a success handoff. Same `input-otp` primitive. |

### Notices

| Piece | Use it for |
| --- | --- |
| [`toast-stack`](registry/ui/toast-stack.tsx) | Short results at the edge of the screen. |
| [`notification-center`](registry/blocks/notification-center.tsx) | A grouped list that keeps read state. |
| [`notification-stack`](registry/ui/notification-stack.tsx) | A depth stack. Dismiss the front card and the next one steps forward. |
| [`card-stack`](registry/ui/card-stack.tsx) | A triage deck you flick left or right, one decision at a time. |

`admin-shell` is the collapsible admin sidebar with breadcrumbs and a command palette. `rail-sidebar` is the two-layer app sidebar: an icon rail for sections and a panel for that section's links. `multi-view` is the block that switches the six views and opens the record panel.

## Install

Register the namespace once in the host `components.json`. The public catalog host is not chosen yet. `https://<your-deployment>` is a placeholder, on this page and on `/docs`.

```bash
npx shadcn@latest add @retana/layered-panel
```

```json
{
  "registries": {
    "@retana": {
      "url": "https://<your-deployment>/r/{name}.json"
    }
  }
}
```

Omit `headers` when the deployment is public and `REGISTRY_TOKEN` is unset. When the deployment gates `/r/*`, add the header. The shadcn CLI substitutes `${REGISTRY_TOKEN}` from the host's `.env.local`.

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

The same namespace can be registered from the CLI:

```bash
npx shadcn@latest registry add @retana=https://<your-deployment>/r/{name}.json
```

A single file, with no namespace:

```bash
npx shadcn@latest add https://<your-deployment>/r/<name>.json
```

You can also copy the files listed for an item under `registry/`. Fix imports only if your aliases differ. `registry.json` is the source of truth for the catalog index (`/`) and for `/items/[name]`. Each item page shows the description, the install command, and the notes from that item's `docs` field. Install notes for the running catalog are on `/docs`.

This catalog is a Next.js app (App Router) on Tailwind v4 and shadcn's Radix Nova style. The optional URL hook in `layered-panel` is the registry file that imports `next/navigation`. Skip that file if you do not want the query string.

## Publishing

Import this repository in Vercel and set the production branch to `CPL`. To serve `/r/*` with no token, set `REGISTRY_PUBLIC=true` and leave `REGISTRY_TOKEN` unset.

`proxy.ts` checks `REGISTRY_TOKEN` first. If it is set, `/r/*` requires `Authorization: Bearer <token>` in production and in development, and `REGISTRY_PUBLIC` is ignored. If no token is set, production serves `/r/*` only when `REGISTRY_PUBLIC=true` and otherwise returns 401. Development serves `/r/*` with no token.

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

```bash
npx shadcn@latest add @retana/layered-panel
```

Props, slots, and the URL hook are in [`registry/ui/layered-panel.tsx`](registry/ui/layered-panel.tsx). For a table beside that panel, use the guide above.

## Catalog

<!-- CATALOG:START -->

`200` items are in `registry.json` on this branch: `166` components, `25` blocks, `3` hooks, and `6` libraries. A name links to its source file.
Run `pnpm readme:catalog` to refresh this list.

Install any registered item with `npx shadcn@latest add @retana/<name>`.

### Detail

- [`layered-panel`](registry/ui/layered-panel.tsx) · block — Right-hand peek panel that expands in place to a two-column detail view. No route change. Optional Next.js URL sync keeps Back working: full collapses to peek, then closes. Ships no theme, cssVars, or global CSS — it uses the host project's shadcn tokens and primitives. Install: `npx shadcn@latest add @retana/layered-panel`.

### Chat and agents

- [`chat-message`](registry/ui/chat-message.tsx) · ui — Message bubble for a person or an assistant, with avatar, time, sending and error states, and copy, retry, and regenerate actions. Install: `npx shadcn@latest add @retana/chat-message`.
- [`message-list`](registry/ui/message-list.tsx) · ui — Scroll container that follows new messages until the reader moves up, then offers a control to jump back to the latest one. Install: `npx shadcn@latest add @retana/message-list`.
- [`chat-composer`](registry/ui/chat-composer.tsx) · ui — Growing textarea that sends on Enter, inserts a newline on Shift+Enter, accepts attachments, swaps in a stop button while generating, and leaves a slot for a model picker. Install: `npx shadcn@latest add @retana/chat-composer`.
- [`streaming-text`](registry/ui/streaming-text.tsx) · ui — Renders text as it arrives, with a caret and a short fade-in, and supports basic markdown. Install: `npx shadcn@latest add @retana/streaming-text`.
- [`reasoning-steps`](registry/ui/reasoning-steps.tsx) · ui — Collapsible list of reasoning or tool steps with pending, active, done, and error states plus a duration. Install: `npx shadcn@latest add @retana/reasoning-steps`.
- [`task-list`](registry/ui/task-list.tsx) · ui — Agent checklist with a progress bar and optional toggling. Install: `npx shadcn@latest add @retana/task-list`.
- [`plan-card`](registry/ui/plan-card.tsx) · ui — Card for a proposed plan, with steps and approve, edit, and reject actions. Install: `npx shadcn@latest add @retana/plan-card`.
- [`question-card`](registry/ui/question-card.tsx) · ui — Agent question with single or multiple choices and an optional free-text answer. Install: `npx shadcn@latest add @retana/question-card`.
- [`inline-citation`](registry/ui/inline-citation.tsx) · ui — Numeric marker that reveals a source title, domain, and excerpt on hover or focus. Install: `npx shadcn@latest add @retana/inline-citation`.
- [`code-block`](registry/ui/code-block.tsx) · ui — Code block with token highlighting, a filename, copy, and line numbers. Install: `npx shadcn@latest add @retana/code-block`.
- [`file-diff`](registry/ui/file-diff.tsx) · ui — Unified diff with added and removed lines, and collapsible runs of unchanged lines. Install: `npx shadcn@latest add @retana/file-diff`.
- [`image-generation`](registry/ui/image-generation.tsx) · ui — Image frame that shows progress and a shimmer while generating, then reveals the result. Install: `npx shadcn@latest add @retana/image-generation`.
- [`ai-document`](registry/ui/ai-document.tsx) · ui — Document where an agent proposes highlighted edits the reader can accept or reject. Install: `npx shadcn@latest add @retana/ai-document`.
- [`suggestion-card`](registry/ui/suggestion-card.tsx) · ui — A system suggestion with confidence, facts, evidence, and confirm, change, or dismiss. Install: `npx shadcn@latest add @retana/suggestion-card`.

### Agents

- [`tool-call`](registry/ui/tool-call.tsx) · ui — One tool invocation with status, parameters, and a result or error. Install: `npx shadcn@latest add @retana/tool-call`.
- [`tool-approval`](registry/ui/tool-approval.tsx) · ui — A human gate before a tool runs, then a compact receipt. Install: `npx shadcn@latest add @retana/tool-approval`.
- [`message-branch`](registry/ui/message-branch.tsx) · ui — Page between regenerated variants of one reply. Install: `npx shadcn@latest add @retana/message-branch`.
- [`context-meter`](registry/ui/context-meter.tsx) · ui — A compact ring for a context window, with a breakdown on click. Install: `npx shadcn@latest add @retana/context-meter`.
- [`prompt-suggestions`](registry/ui/prompt-suggestions.tsx) · ui — A chip row that seeds a composer. Install: `npx shadcn@latest add @retana/prompt-suggestions`.
- [`source-list`](registry/ui/source-list.tsx) · ui — A collapsible list of numbered sources with excerpts. Install: `npx shadcn@latest add @retana/source-list`.
- [`message-error`](registry/ui/message-error.tsx) · ui — An inline failure under an assistant message, with retry. Install: `npx shadcn@latest add @retana/message-error`.
- [`system-notice`](registry/ui/system-notice.tsx) · ui — A slim in-thread status line, not a message bubble. Install: `npx shadcn@latest add @retana/system-notice`.
- [`slash-menu`](registry/ui/slash-menu.tsx) · ui — A slash command menu anchored to a textarea. Install: `npx shadcn@latest add @retana/slash-menu`.
- [`char-limit`](registry/ui/char-limit.tsx) · ui — A ring and counter that appears as an input nears its limit. Install: `npx shadcn@latest add @retana/char-limit`.
- [`parameter-slider`](registry/ui/parameter-slider.tsx) · ui — A labelled slider with a live value and a reset. Install: `npx shadcn@latest add @retana/parameter-slider`.
- [`confidence-badge`](registry/ui/confidence-badge.tsx) · ui — A 0–1 score as a badge, dial, or bar, with a text tier. Install: `npx shadcn@latest add @retana/confidence-badge`.
- [`voice-orb`](registry/ui/voice-orb.tsx) · ui — A state-driven voice visual that pauses when motion is reduced. Install: `npx shadcn@latest add @retana/voice-orb`.
- [`push-to-talk`](registry/ui/push-to-talk.tsx) · ui — Hold to record and release to send, with a toggle mode. Install: `npx shadcn@latest add @retana/push-to-talk`.
- [`audio-bars`](registry/ui/audio-bars.tsx) · ui — A row of activity bars driven by levels or an idle pulse. Install: `npx shadcn@latest add @retana/audio-bars`.
- [`audio-player`](registry/ui/audio-player.tsx) · ui — A compact player with a keyboard scrub bar. Install: `npx shadcn@latest add @retana/audio-player`.
- [`synced-transcript`](registry/ui/synced-transcript.tsx) · ui — A transcript that highlights the word at the current time. Install: `npx shadcn@latest add @retana/synced-transcript`.
- [`mic-select`](registry/ui/mic-select.tsx) · ui — A microphone or camera picker with permission states. Install: `npx shadcn@latest add @retana/mic-select`.
- [`use-device-capabilities`](registry/hooks/use-device-capabilities.ts) · hook — Browser capability, storage, and network hooks. Nothing is prompted or uploaded. Install: `npx shadcn@latest add @retana/use-device-capabilities`.
- [`capability-gate`](registry/ui/capability-gate.tsx) · ui — Renders children only after a feature check, without flashing the fallback. Install: `npx shadcn@latest add @retana/capability-gate`.
- [`capability-grid`](registry/ui/capability-grid.tsx) · ui — A local report of what this browser can do. Install: `npx shadcn@latest add @retana/capability-grid`.
- [`storage-meter`](registry/ui/storage-meter.tsx) · ui — Origin storage used, with a persistence request. Install: `npx shadcn@latest add @retana/storage-meter`.
- [`network-status`](registry/ui/network-status.tsx) · ui — An online or offline indicator, with an optional banner. Install: `npx shadcn@latest add @retana/network-status`.
- [`download-progress`](registry/ui/download-progress.tsx) · ui — A card for a large asset download, with speed and ETA. Install: `npx shadcn@latest add @retana/download-progress`.
- [`use-webcam`](registry/hooks/use-webcam.ts) · hook — Start, stop, and switch a camera stream. Tracks stop on unmount. Install: `npx shadcn@latest add @retana/use-webcam`.
- [`webcam-canvas`](registry/ui/webcam-canvas.tsx) · ui — A camera preview with a frame callback. The loop pauses offscreen. Install: `npx shadcn@latest add @retana/webcam-canvas`.
- [`detection-overlay`](registry/ui/detection-overlay.tsx) · ui — Labelled boxes over an image, with a legend. Install: `npx shadcn@latest add @retana/detection-overlay`.
- [`scan-overlay`](registry/ui/scan-overlay.tsx) · ui — A processing veil over an image, still when motion is reduced. Install: `npx shadcn@latest add @retana/scan-overlay`.
- [`entity-text`](registry/ui/entity-text.tsx) · ui — Inline highlights, masks, or redaction tokens for annotated spans. Install: `npx shadcn@latest add @retana/entity-text`.
- [`force-graph`](registry/ui/force-graph.tsx) · ui — An SVG node-link graph with a list fallback. Install: `npx shadcn@latest add @retana/force-graph`.
- [`confusion-matrix`](registry/ui/confusion-matrix.tsx) · ui — An N by N heat grid with counts or percents and a table fallback. Install: `npx shadcn@latest add @retana/confusion-matrix`.
- [`event-log`](registry/ui/event-log.tsx) · ui — A newest-first log with filters, pause, and expandable payloads. Install: `npx shadcn@latest add @retana/event-log`.
- [`error-boundary`](registry/ui/error-boundary.tsx) · ui — Catches a section error and offers try again. Install: `npx shadcn@latest add @retana/error-boundary`.
- [`passphrase-gate`](registry/ui/passphrase-gate.tsx) · ui — Create or unlock with a passphrase. The value is not stored. Install: `npx shadcn@latest add @retana/passphrase-gate`.
- [`artifact-panel`](registry/ui/artifact-panel.tsx) · ui — A docked canvas for generated content, with copy and download. Install: `npx shadcn@latest add @retana/artifact-panel`.
- [`language-pair`](registry/ui/language-pair.tsx) · ui — From and to language pickers with a swap. Install: `npx shadcn@latest add @retana/language-pair`.
- [`install-command`](registry/ui/install-command.tsx) · ui — Package-manager tabs that rewrite one install command and copy it. Install: `npx shadcn@latest add @retana/install-command`.
- [`demo-collage`](registry/blocks/demo-collage.tsx) · block — A grid of live mini demos that render when they scroll into view. Install: `npx shadcn@latest add @retana/demo-collage`.

### Forms

- [`otp-field`](registry/ui/otp-field.tsx) · ui — One-time code field on the input-otp primitive, with animated success and error states and a resend countdown. Install: `npx shadcn@latest add @retana/otp-field`.
- [`dissolve-input`](registry/ui/dissolve-input.tsx) · ui — Input whose text breaks into fading particles when it is submitted or cleared. Install: `npx shadcn@latest add @retana/dissolve-input`.
- [`multi-select`](registry/ui/multi-select.tsx) · ui — Multi-select with search, removable chips, and the option to create a new value. Install: `npx shadcn@latest add @retana/multi-select`.
- [`color-picker`](registry/ui/color-picker.tsx) · ui — Accessible color picker with a saturation and brightness field, hue, alpha, and a hex input. Install: `npx shadcn@latest add @retana/color-picker`.
- [`color-palette`](registry/ui/color-palette.tsx) · ui — Grid of color swatches that copy their value on click and confirm it. Install: `npx shadcn@latest add @retana/color-palette`.
- [`magnetic-dropzone`](registry/ui/magnetic-dropzone.tsx) · ui — Drop zone that leans toward the pointer, with a file list, progress, and type and size checks. Install: `npx shadcn@latest add @retana/magnetic-dropzone`.
- [`gooey-slider`](registry/ui/gooey-slider.tsx) · ui — Slider with an organic trail while dragging, built on the slider primitive. Install: `npx shadcn@latest add @retana/gooey-slider`.
- [`password-field`](registry/ui/password-field.tsx) · ui — A password field with a reveal control whose slash draws across the eye. Install: `npx shadcn@latest add @retana/password-field`.
- [`search-field`](registry/ui/search-field.tsx) · ui — A search field with a clear control that returns focus to the input. Install: `npx shadcn@latest add @retana/search-field`.
- [`segmented-control`](registry/ui/segmented-control.tsx) · ui — A small set of related choices. Arrow keys move the selection and the highlight glides. Install: `npx shadcn@latest add @retana/segmented-control`.
- [`number-field`](registry/ui/number-field.tsx) · ui — A bounded number with step buttons, keyboard steps, and an optional scrub. Install: `npx shadcn@latest add @retana/number-field`.
- [`tag-input`](registry/ui/tag-input.tsx) · ui — Turns short text values into removable tags. Install: `npx shadcn@latest add @retana/tag-input`.
- [`time-picker`](registry/ui/time-picker.tsx) · ui — Chooses a time with a listbox and arrow keys. Install: `npx shadcn@latest add @retana/time-picker`.
- [`inline-edit`](registry/ui/inline-edit.tsx) · ui — Renames in place: the text becomes a field without moving. Install: `npx shadcn@latest add @retana/inline-edit`.
- [`expanding-search`](registry/ui/expanding-search.tsx) · ui — An icon that morphs into a search field with results beneath it. Install: `npx shadcn@latest add @retana/expanding-search`.
- [`chip-group`](registry/ui/chip-group.tsx) · ui — Filters a few facets with chips that show the current pick. Install: `npx shadcn@latest add @retana/chip-group`.
- [`password-strength`](registry/ui/password-strength.tsx) · ui — Shows how strong a new password is while it is typed. Install: `npx shadcn@latest add @retana/password-strength`.
- [`signature-pad`](registry/ui/signature-pad.tsx) · ui — Ink that thins with speed, with undo, replay, and PNG or SVG export. Install: `npx shadcn@latest add @retana/signature-pad`.
- [`date-range-picker`](registry/ui/date-range-picker.tsx) · ui — A range picker with two months, presets, and keyboard selection. Install: `npx shadcn@latest add @retana/date-range-picker`.
- [`phone-input`](registry/ui/phone-input.tsx) · ui — A phone field with a country picker, formatting as you type, and E.164 output. Install: `npx shadcn@latest add @retana/phone-input`.
- [`shortcut-recorder`](registry/ui/shortcut-recorder.tsx) · ui — Records key combinations, warns on conflicts, and lists them in a cheatsheet. Install: `npx shadcn@latest add @retana/shortcut-recorder`.
- [`mention-input`](registry/ui/mention-input.tsx) · ui — A textarea where @people and #channels act as single tokens. Install: `npx shadcn@latest add @retana/mention-input`.
- [`rich-text-editor`](registry/ui/rich-text-editor.tsx) · ui — A lightweight editor with markdown shortcuts, a floating toolbar, a slash menu, and HTML and markdown output. Install: `npx shadcn@latest add @retana/rich-text-editor`.
- [`billing-toggle`](registry/ui/billing-toggle.tsx) · ui — A monthly and yearly switch with a savings badge and prices that roll. Install: `npx shadcn@latest add @retana/billing-toggle`.
- [`radio-cards`](registry/ui/radio-cards.tsx) · ui — Selectable option cards with one tab stop and arrow-key behavior. Install: `npx shadcn@latest add @retana/radio-cards`.
- [`two-factor-card`](registry/ui/two-factor-card.tsx) · ui — Verification card for a one-time code, with a countdown, alternate methods, and a success handoff. Install: `npx shadcn@latest add @retana/two-factor-card`.
- [`bug-report-form`](registry/ui/bug-report-form.tsx) · ui — Card form for a bug report: title, description, type chips, priority, environment, and a screenshot dropzone, with validation and submit states. Install: `npx shadcn@latest add @retana/bug-report-form`.

### Media and content

- [`video-player`](registry/ui/video-player.tsx) · ui — Video player with custom controls for play, seek, volume, speed, and fullscreen, plus keyboard shortcuts. Install: `npx shadcn@latest add @retana/video-player`.
- [`lightbox`](registry/ui/lightbox.tsx) · ui — Fullscreen image viewer with next and previous controls, zoom, and keyboard support. Install: `npx shadcn@latest add @retana/lightbox`.
- [`logo-marquee`](registry/ui/logo-marquee.tsx) · ui — Infinite logo row that pauses on hover and fades at the edges. Install: `npx shadcn@latest add @retana/logo-marquee`.
- [`halftone-image`](registry/ui/halftone-image.tsx) · ui — Image drawn as dots on a canvas that grow toward the pointer. Install: `npx shadcn@latest add @retana/halftone-image`.
- [`attachment-chip`](registry/ui/attachment-chip.tsx) · ui — File chip with a type icon, size, optional image preview, and remove. Install: `npx shadcn@latest add @retana/attachment-chip`.
- [`marker`](registry/ui/marker.tsx) · ui — Animated highlighter mark behind a span of text. Install: `npx shadcn@latest add @retana/marker`.
- [`press-sound`](registry/ui/press-sound.tsx) · ui — Hook and wrapper that play a short synthesized click on press, with a shared mute. Install: `npx shadcn@latest add @retana/press-sound`.
- [`text-reveal`](registry/ui/text-reveal.tsx) · ui — Reveals a short line once, word by word, and shows the plain text if motion is reduced. Install: `npx shadcn@latest add @retana/text-reveal`.
- [`text-morph`](registry/ui/text-morph.tsx) · ui — Morphs one short label into the next. Shared letters glide and the width follows. Install: `npx shadcn@latest add @retana/text-morph`.
- [`text-shimmer`](registry/ui/text-shimmer.tsx) · ui — A calm light across a short status line while work is ongoing. Sets aria-busy. Install: `npx shadcn@latest add @retana/text-shimmer`.
- [`in-view-title`](registry/ui/in-view-title.tsx) · ui — A section title that reveals as it scrolls into view: blur, word, line, tracking, or wipe. Install: `npx shadcn@latest add @retana/in-view-title`.
- [`slot-text`](registry/ui/slot-text.tsx) · ui — Text and numbers that spin into their next value on staggered reels, like a slot machine. Install: `npx shadcn@latest add @retana/slot-text`.
- [`avatar-group`](registry/ui/avatar-group.tsx) · ui — Shows a team in a small stack, with an overflow count. Install: `npx shadcn@latest add @retana/avatar-group`.
- [`empty-state`](registry/ui/empty-state.tsx) · ui — A useful next step when there is nothing to show yet. Install: `npx shadcn@latest add @retana/empty-state`.
- [`tree-view`](registry/ui/tree-view.tsx) · ui — Navigates nested folders and structured content from the keyboard. Install: `npx shadcn@latest add @retana/tree-view`.
- [`filter-toolbar`](registry/ui/filter-toolbar.tsx) · ui — Keeps collection filters close and easy to reset. Install: `npx shadcn@latest add @retana/filter-toolbar`.
- [`animated-counter`](registry/ui/animated-counter.tsx) · ui — Gives a changing total a clear sense of movement. Install: `npx shadcn@latest add @retana/animated-counter`.
- [`image-compare`](registry/ui/image-compare.tsx) · ui — Drags a divider across two images to see what changed. Install: `npx shadcn@latest add @retana/image-compare`.
- [`carousel`](registry/ui/carousel.tsx) · ui — Browses a row of slides with controls, tabs, and arrow keys. Install: `npx shadcn@latest add @retana/carousel`.
- [`card-stack`](registry/ui/card-stack.tsx) · ui — Reviews a deck one card at a time, with a throw and an undo. Install: `npx shadcn@latest add @retana/card-stack`.
- [`timeline`](registry/ui/timeline.tsx) · ui — Follows what happened, newest first, grouped by day. Install: `npx shadcn@latest add @retana/timeline`.
- [`json-viewer`](registry/ui/json-viewer.tsx) · ui — A collapsible JSON tree with search and copy for a value or a path. Install: `npx shadcn@latest add @retana/json-viewer`.
- [`comment-thread`](registry/ui/comment-thread.tsx) · ui — Threaded comments with replies, reactions, and resolve. Install: `npx shadcn@latest add @retana/comment-thread`.
- [`magnetic-bento`](registry/ui/magnetic-bento.tsx) · ui — Bento grid with one shared highlight that glides and stretches between cards. Install: `npx shadcn@latest add @retana/magnetic-bento`.

### Tables and views

- [`crm-table`](registry/ui/crm-table.tsx) · ui — CRM-shaped table with avatar and name, a status badge, stage, owner, and last activity. Column helpers match a TanStack column definition so they can be passed to AdminDataTable when that item is installed. Install: `npx shadcn@latest add @retana/crm-table`.
- [`metric-card`](registry/ui/metric-card.tsx) · ui — A compact summary for a number that needs a label and context. Install: `npx shadcn@latest add @retana/metric-card`.
- [`adaptive-table`](registry/ui/adaptive-table.tsx) · ui — Grouped table that drops, folds, and stretches columns to its container width. For a narrow panel. data-table is the full TanStack table; crm-table is a fixed contact layout. Install: `npx shadcn@latest add @retana/adaptive-table`.
- [`multi-view-core`](registry/lib/multi-view.ts) · lib — Field schema and pure helpers for one collection shown in many views: search, filter, sort, group, month grid, timeline scale, Intl formatting, and CSV. Install: `npx shadcn@latest add @retana/multi-view-core`.
- [`use-multi-view`](registry/hooks/use-multi-view.ts) · hook — View, search, filter, sort, group, selection, and open-record state, controlled or uncontrolled, with an optional URL adapter. Install: `npx shadcn@latest add @retana/use-multi-view`.
- [`view-table`](registry/ui/view-table.tsx) · ui — Schema-driven table with checkbox selection, sortable headers, per-type cells, row actions, and column visibility. Install: `npx shadcn@latest add @retana/view-table`.
- [`view-kanban`](registry/ui/view-kanban.tsx) · ui — Status columns with counts and sums, draggable cards, a keyboard sensor, a Move to menu, an optional summary card, a collapsed overflow, and a short highlight ring. Install: `npx shadcn@latest add @retana/view-kanban`.
- [`view-calendar`](registry/ui/view-calendar.tsx) · ui — Month grid for a date field, with overflow, drag or Alt+Arrow reschedule, and an agenda below 560px. Install: `npx shadcn@latest add @retana/view-calendar`.
- [`view-timeline`](registry/ui/view-timeline.tsx) · ui — Horizontal start/end schedule with collapsible groups, zoom, a today line, and keyboard move or resize. Install: `npx shadcn@latest add @retana/view-timeline`.
- [`view-grouped-list`](registry/ui/view-grouped-list.tsx) · ui — Rows grouped by a field, with collapsible headers and compact trailing fields including a progress ring. Install: `npx shadcn@latest add @retana/view-grouped-list`.
- [`view-gallery`](registry/ui/view-gallery.tsx) · ui — Responsive cards with an optional cover, status, clamped description, footer slot, and quick filter chips. Install: `npx shadcn@latest add @retana/view-gallery`.
- [`record-properties`](registry/ui/record-properties.tsx) · ui — Schema-driven property rows with inline editing per field type, Enter to commit, and Escape to cancel. Install: `npx shadcn@latest add @retana/record-properties`.
- [`multi-view`](registry/blocks/multi-view.tsx) · block — One collection in table, kanban, calendar, timeline, grouped list, and gallery, with shared search, a record panel, and a create form. Install: `npx shadcn@latest add @retana/multi-view`.
- [`well-card`](registry/ui/well-card.tsx) · ui — Muted outer well with a header and an inset card. The host theme supplies the surfaces. Install: `npx shadcn@latest add @retana/well-card`.
- [`stat-strip`](registry/ui/stat-strip.tsx) · ui — A dense row or a divided panel of labelled numbers, each with a text delta. Distinct from metric-card and stats-band. Install: `npx shadcn@latest add @retana/stat-strip`.
- [`priority-badge`](registry/ui/priority-badge.tsx) · ui — A four-level priority chip with a signal glyph. Critical uses the destructive tone. Install: `npx shadcn@latest add @retana/priority-badge`.
- [`attention-list`](registry/ui/attention-list.tsx) · ui — A prioritized list of rows that need a decision, with chips, an empty state, and a loading skeleton. Install: `npx shadcn@latest add @retana/attention-list`.
- [`record-timeline`](registry/ui/record-timeline.tsx) · ui — The lifecycle of one record, oldest first, with status marks. timeline stays the newest-first activity feed. Install: `npx shadcn@latest add @retana/record-timeline`.
- [`suggested-choice-dialog`](registry/ui/suggested-choice-dialog.tsx) · ui — A confirm dialog whose suggested radio starts selected. radio-cards remains the large option cards. Install: `npx shadcn@latest add @retana/suggested-choice-dialog`.
- [`record-header`](registry/ui/record-header.tsx) · ui — Breadcrumb, title, status, meta, people, and actions for one record. page-header remains the scrolling page fold. Install: `npx shadcn@latest add @retana/record-header`.

### Charts

- [`sparkline`](registry/ui/sparkline.tsx) · ui — A compact trend beside a value. Install: `npx shadcn@latest add @retana/sparkline`.
- [`gauge`](registry/ui/gauge.tsx) · ui — Shows a value against a known range. Install: `npx shadcn@latest add @retana/gauge`.
- [`activity-heatmap`](registry/ui/activity-heatmap.tsx) · ui — A year of activity, one cell per day. Install: `npx shadcn@latest add @retana/activity-heatmap`.
- [`bar-chart`](registry/ui/bar-chart.tsx) · ui — Compare one measure across categories and read a bar's value. Install: `npx shadcn@latest add @retana/bar-chart`.
- [`line-chart`](registry/ui/line-chart.tsx) · ui — A multi-series line chart with a crosshair and legend toggles. Install: `npx shadcn@latest add @retana/line-chart`.
- [`donut-chart`](registry/ui/donut-chart.tsx) · ui — A donut whose arcs show shares, with the active value in the center. Install: `npx shadcn@latest add @retana/donut-chart`.
- [`streamgraph`](registry/ui/streamgraph.tsx) · ui — Layered streams with a layer you can isolate. Install: `npx shadcn@latest add @retana/streamgraph`.
- [`brush-chart`](registry/ui/brush-chart.tsx) · ui — A dense series with an overview strip you drag to zoom. Install: `npx shadcn@latest add @retana/brush-chart`.
- [`ridgeline`](registry/ui/ridgeline.tsx) · ui — Overlapping distributions, one ridge per group. Install: `npx shadcn@latest add @retana/ridgeline`.
- [`treemap`](registry/ui/treemap.tsx) · ui — A squarified treemap that drills in and comes back by breadcrumb. Install: `npx shadcn@latest add @retana/treemap`.
- [`waffle-chart`](registry/ui/waffle-chart.tsx) · ui — A ten by ten chart where every cell is one percent. Install: `npx shadcn@latest add @retana/waffle-chart`.
- [`slope-chart`](registry/ui/slope-chart.tsx) · ui — Before and after on two axes, with the rank move beside each value. Install: `npx shadcn@latest add @retana/slope-chart`.
- [`annotated-trend-chart`](registry/ui/annotated-trend-chart.tsx) · ui — An SVG trend with a target line, a highlighted band, an end value, and a comparison series. line-chart remains the generic crosshair chart. Install: `npx shadcn@latest add @retana/annotated-trend-chart`.
- [`ranked-bars`](registry/ui/ranked-bars.tsx) · ui — Horizontal share bars sorted by value, with a label, meta, and percent. admin-charts RankedBars stays the analytics card. Install: `npx shadcn@latest add @retana/ranked-bars`.
- [`breakdown-bar`](registry/ui/breakdown-bar.tsx) · ui — A total, a segmented bar, and a legend. Unlike usage-meter, there is no limit. Install: `npx shadcn@latest add @retana/breakdown-bar`.
- [`radial-gauge`](registry/ui/radial-gauge.tsx) · ui — A half-circle meter with ticks and a needle. Values above max are labelled over budget and the needle stops at the end. gauge remains the filled arc. Install: `npx shadcn@latest add @retana/radial-gauge`.
- [`tier-distribution`](registry/ui/tier-distribution.tsx) · ui — Two to four tiers. Each shows its count and a block sized by share, and the row is a radio group. Install: `npx shadcn@latest add @retana/tier-distribution`.

### Collaboration

- [`presence`](registry/lib/presence.ts) · lib — Provider-agnostic presence types, an in-memory adapter, and hooks for others, self, updates, and a debounced typing flag. Install: `npx shadcn@latest add @retana/presence`.
- [`presence-liveblocks`](registry/lib/presence-liveblocks.tsx) · lib — Liveblocks room adapter for the presence hooks. Uses @liveblocks/client and @liveblocks/react. Does not depend on the AGPL server package. Install: `npx shadcn@latest add @retana/presence-liveblocks`.
- [`presence-supabase`](registry/lib/presence-supabase.ts) · lib — Supabase Realtime Presence adapter. Tracks a channel and maps sync, join, and leave onto the shared presence hooks. Install: `npx shadcn@latest add @retana/presence-supabase`.
- [`presence-avatars`](registry/ui/presence-avatars.tsx) · ui — Avatar stack for people in the room, with overflow, tooltips, a live dot, and an optional single avatar for all agents. Install: `npx shadcn@latest add @retana/presence-avatars`.
- [`live-cursors`](registry/ui/live-cursors.tsx) · ui — Cursors and name labels positioned inside a relative container. Pointer updates are container-relative and throttled with requestAnimationFrame. Install: `npx shadcn@latest add @retana/live-cursors`.
- [`typing-indicator`](registry/ui/typing-indicator.tsx) · ui — Polite live region that names who is typing, including “Ana and 2 others are typing…”. Install: `npx shadcn@latest add @retana/typing-indicator`.
- [`presence-outline`](registry/ui/presence-outline.tsx) · ui — Outlines and labels an element when another person's selection presence matches. Install: `npx shadcn@latest add @retana/presence-outline`.

### Navigation

- [`dock-nav`](registry/ui/dock-nav.tsx) · ui — Floating pill navigation with pointer magnification, tooltips, an active-route dot, grouped items, and a search item that morphs into a field under the bar. Install: `npx shadcn@latest add @retana/dock-nav`.
- [`command-palette`](registry/ui/command-palette.tsx) · ui — Searchable command list on the host command primitive. Admin shell keeps its own nav palette. Install: `npx shadcn@latest add @retana/command-palette`.
- [`rail-sidebar`](registry/blocks/rail-sidebar.tsx) · block — Two-layer app sidebar: circular section buttons on an icon rail and a panel for that section's navigation, with an optional scope toggle, alert counts, and footer links. Built on the host shadcn sidebar, including its mobile sheet. Install: `npx shadcn@latest add @retana/rail-sidebar`.
- [`tree-nav`](registry/ui/tree-nav.tsx) · ui — Navigation card with a person header, nested rows, counts, a guide line, and a keyboard tree. Install: `npx shadcn@latest add @retana/tree-nav`.
- [`mega-menu`](registry/ui/mega-menu.tsx) · ui — Navigation bar whose triggers open a wide panel. A container under 768px stacks the same panel as an accordion. Install: `npx shadcn@latest add @retana/mega-menu`.

### Page blocks

- [`signup-form`](registry/blocks/signup-form.tsx) · block — Account creation with validation and password strength. Install: `npx shadcn@latest add @retana/signup-form`.
- [`plan-comparison`](registry/blocks/plan-comparison.tsx) · block — Compare plan differences across billing periods. Install: `npx shadcn@latest add @retana/plan-comparison`.
- [`notification-center`](registry/blocks/notification-center.tsx) · block — A home for updates with read state and grouped disclosure. Install: `npx shadcn@latest add @retana/notification-center`.
- [`changelog-feed`](registry/blocks/changelog-feed.tsx) · block — Release notes you can filter and open in place. Install: `npx shadcn@latest add @retana/changelog-feed`.
- [`sign-in`](registry/blocks/sign-in.tsx) · block — A sign-in card that moves from email to a code. Install: `npx shadcn@latest add @retana/sign-in`.
- [`page-header`](registry/blocks/page-header.tsx) · block — A project header that folds into a compact bar as you scroll. Install: `npx shadcn@latest add @retana/page-header`.
- [`empty-states`](registry/blocks/empty-states.tsx) · block — Several empty states in one switchable set. Install: `npx shadcn@latest add @retana/empty-states`.
- [`login-centered`](registry/blocks/login-centered.tsx) · block — A passkey-first login that continues through email and a code. Install: `npx shadcn@latest add @retana/login-centered`.
- [`site-header`](registry/blocks/site-header.tsx) · block — A sticky header that turns solid on scroll, with a mobile sheet. Install: `npx shadcn@latest add @retana/site-header`.
- [`site-footer`](registry/blocks/site-footer.tsx) · block — A footer with link columns and a newsletter field. Install: `npx shadcn@latest add @retana/site-footer`.
- [`hero-section`](registry/blocks/hero-section.tsx) · block — Three SaaS heroes: dashboard, workflow, and editorial. Install: `npx shadcn@latest add @retana/hero-section`.
- [`faq-section`](registry/blocks/faq-section.tsx) · block — FAQs as an accordion, a topic rail, or a searchable list. Install: `npx shadcn@latest add @retana/faq-section`.
- [`contact-section`](registry/blocks/contact-section.tsx) · block — A contact form that becomes a confirmation, plus support channels. Install: `npx shadcn@latest add @retana/contact-section`.
- [`blog-grid`](registry/blocks/blog-grid.tsx) · block — A blog index with a featured post, filters, and an in-place reader. Install: `npx shadcn@latest add @retana/blog-grid`.
- [`comparison-table`](registry/blocks/comparison-table.tsx) · block — An us-versus-them table with a stacked phone view. Install: `npx shadcn@latest add @retana/comparison-table`.
- [`stats-band`](registry/blocks/stats-band.tsx) · block — Headline numbers that count up in view. Install: `npx shadcn@latest add @retana/stats-band`.
- [`cta-section`](registry/blocks/cta-section.tsx) · block — A closing call to action, a split setup, or a dismissible banner. Install: `npx shadcn@latest add @retana/cta-section`.
- [`newsletter-signup`](registry/blocks/newsletter-signup.tsx) · block — An email signup framed by a stack of past issues. Install: `npx shadcn@latest add @retana/newsletter-signup`.
- [`triage-dashboard`](registry/blocks/triage-dashboard.tsx) · block — Greeting, stat strip, annotated trend, attention list, ranked bars, and a period card. Pass shell to wrap it in the rail sidebar. Install: `npx shadcn@latest add @retana/triage-dashboard`.
- [`case-review`](registry/blocks/case-review.tsx) · block — One record: header, tabs and timeline, suggestion, cost breakdown, confirm dialog, and an undo toast. Install: `npx shadcn@latest add @retana/case-review`.

### Actions and overlays

- [`theme-switch`](registry/ui/theme-switch.tsx) · ui — Four ways to move between light and dark: fade, eclipse, split, and rise. Uses the View Transitions API when the browser has it, and changes the theme immediately otherwise. Install: `npx shadcn@latest add @retana/theme-switch`.
- [`copy-button`](registry/ui/copy-button.tsx) · ui — Copies a value and confirms in place, with a drawn check and a live announcement. Install: `npx shadcn@latest add @retana/copy-button`.
- [`expandable-card`](registry/ui/expandable-card.tsx) · ui — A dense card that grows in width and height to show more, and closes with Escape. Install: `npx shadcn@latest add @retana/expandable-card`.
- [`action-button`](registry/ui/action-button.tsx) · ui — A compact button that moves through pending and success after an async action. Install: `npx shadcn@latest add @retana/action-button`.
- [`split-button`](registry/ui/split-button.tsx) · ui — A primary action with a menu of nearby alternatives. Install: `npx shadcn@latest add @retana/split-button`.
- [`hold-to-confirm`](registry/ui/hold-to-confirm.tsx) · ui — Confirms a destructive action by holding, not by a single tap. Install: `npx shadcn@latest add @retana/hold-to-confirm`.
- [`swipe-actions`](registry/ui/swipe-actions.tsx) · ui — Reveals row actions with a swipe, and the same actions from a menu. Install: `npx shadcn@latest add @retana/swipe-actions`.
- [`user-menu`](registry/ui/user-menu.tsx) · ui — Account, settings, theme, and sign out behind the avatar. A sheet on a narrow screen. Install: `npx shadcn@latest add @retana/user-menu`.
- [`confirm-morph`](registry/ui/confirm-morph.tsx) · ui — A destructive button that morphs into an inline confirmation, a spinner, and a result with undo. Install: `npx shadcn@latest add @retana/confirm-morph`.
- [`toast-stack`](registry/ui/toast-stack.tsx) · ui — Stacks short results at the edge until they are dismissed. An undo appearance is a dark pill that pauses on hover. Install: `npx shadcn@latest add @retana/toast-stack`.
- [`usage-meter`](registry/ui/usage-meter.tsx) · ui — Shows what fills an allowance and how close it is to the limit. Install: `npx shadcn@latest add @retana/usage-meter`.
- [`stepper`](registry/ui/stepper.tsx) · ui — Shows where a person is in a multi-step flow and what is done. Install: `npx shadcn@latest add @retana/stepper`.
- [`announcement-bar`](registry/ui/announcement-bar.tsx) · ui — A top banner that rotates messages and collapses when dismissed. Install: `npx shadcn@latest add @retana/announcement-bar`.
- [`bottom-sheet`](registry/ui/bottom-sheet.tsx) · ui — A sheet that rests at a peek or full height. Install: `npx shadcn@latest add @retana/bottom-sheet`.
- [`notification-stack`](registry/ui/notification-stack.tsx) · ui — A depth stack of notices. Dismiss the front card and the next one steps forward. Install: `npx shadcn@latest add @retana/notification-stack`.

### Admin

- [`admin-utils`](registry/lib/admin-types.ts) · lib — Slug, reorder, CSV, date range, and analytics helpers for an admin that does not care which router or database the host uses. Install: `npx shadcn@latest add @retana/admin-utils`.
- [`admin-shell`](registry/ui/admin-shell.tsx) · ui — Collapsible shadcn sidebar, breadcrumbs from one nav config, a command palette, and a theme toggle that uses the host controller when you pass one. Install: `npx shadcn@latest add @retana/admin-shell`.
- [`sortable-list`](registry/ui/sortable-list.tsx) · ui — Mouse and keyboard drag list with screen-reader announcements, move buttons, a position number, and optimistic reorder that rolls back. Install: `npx shadcn@latest add @retana/sortable-list`.
- [`sortable-board`](registry/ui/sortable-board.tsx) · ui — Project board with category tabs and counts, search, list or grid, a homepage switch per row, and edit. Install: `npx shadcn@latest add @retana/sortable-board`.
- [`entity-form`](registry/ui/entity-form.tsx) · ui — Dialog or sheet form for one record, plus confirm-delete, an empty state, and a collapsible section. Submit stays disabled while busy. Install: `npx shadcn@latest add @retana/entity-form`.
- [`settings-form`](registry/ui/settings-form.tsx) · ui — Grouped cards over a string key-value map, with a sticky save bar, discard, and a beforeunload guard. Install: `npx shadcn@latest add @retana/settings-form`.
- [`media-library`](registry/ui/media-library.tsx) · ui — Dropzone field with image and video preview, a library picker, and a grid or table browser. Upload goes through an injected function and blocks submit while it runs. Install: `npx shadcn@latest add @retana/media-library`.
- [`data-table`](registry/ui/data-table.tsx) · ui — TanStack table for a bookings-style list: tabs, search, filters, sorting, column visibility, multi-select bulk actions, CSV export, and a detail side panel. Install: `npx shadcn@latest add @retana/data-table`.
- [`admin-charts`](registry/ui/admin-charts.tsx) · ui — KPI card with delta and sparkline, area trend with a range control, funnel, ranked bars, a day-by-hour heatmap, and a scroll-depth chart. Accent colors come from a tone mapped to chart-1…5. Install: `npx shadcn@latest add @retana/admin-charts`.
- [`overview-dashboard`](registry/ui/overview-dashboard.tsx) · ui — Composes KPI cards, a trend chart, an upcoming list, and content counts into one overview. Install: `npx shadcn@latest add @retana/overview-dashboard`.
- [`admin-kit`](registry/blocks/admin-kit.tsx) · block — Working admin demo: shell, projects, content lists, settings, media, bookings, and analytics, backed by an in-memory adapter and Spanish sample data. Install: `npx shadcn@latest add @retana/admin-kit`.
- [`supabase-admin`](registry/lib/supabase-admin.ts) · lib — Typed adapter for the admin ports. The host passes in @supabase/supabase-js. Includes SQL for content tables, RLS, and a media bucket. This item does not connect to a database. Install: `npx shadcn@latest add @retana/supabase-admin`.

<!-- CATALOG:END -->

## Develop

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

`pnpm registry:build` validates the registry and writes `public/r/*.json`. `pnpm readme:catalog` refreshes the catalog list in this file. New items follow [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits

Pieces inherit the host theme. Paid component libraries are never ported. An unlicensed reference is reimplemented from behavior only.

- **Arc UI free tier** by Elia Kuratli, MIT ([arc-library](https://github.com/kuratlielia/arc-library)). Charts, blocks, inputs, actions, and the optional behaviors named above. No Arc stylesheet, tokens, or Pro items. Shared timing lives in `registry/lib/motion.ts`.
- **Sakani Design System** by Samuel Okpere, MIT ([Sakani-design-system](https://github.com/samzydd/Sakani-design-system)), inspired `rail-sidebar`. No code, CSS modules, tokens, Geist, or logo were copied.
- **`adaptive-table`** is a clean-room reimplementation from a behavior description. No names, icons, or rows from that reference were copied.
- **Multi-view** is an independent implementation of the common pattern (one dataset, several views). No shadcn/studio code, data, or assets were used.
- **Liveblocks** client packages `@liveblocks/client` and `@liveblocks/react` are Apache-2.0. `@liveblocks/node` (Apache-2.0) is documented for a host auth route and is not a dependency of this repo. `@liveblocks/server` and the `liveblocks` CLI are AGPL-3.0 and are not used. The Free plan needs a visible Liveblocks badge and allows 10 concurrent connections per room.
- **Admin list behavior** is adapted from [Maniruzzaman Jubayer's MIT admin panel](https://github.com/jubayer910/Admin-panel) and reimplemented on shadcn primitives. The Supabase adapter includes SQL and does not connect this repo to a database.

The upstream MIT texts and the clean-room notes are in [NOTICE](NOTICE).

## License

[MIT](LICENSE). Copyright (c) 2026 [Eduardo Retana](https://eduardoretana.com).
