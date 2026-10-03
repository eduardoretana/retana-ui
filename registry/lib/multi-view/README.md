# Multi-view wiring

`multi-view` renders one collection through several views. Pass records in and handle mutations in the callbacks. If a callback rejects, the optimistic row rolls back.

## Install

One command copies the block, the six views, `record-properties`, `multi-view-core`, `use-multi-view`, `layered-panel`, and `entity-form`:

```bash
npx shadcn@latest add @retana/multi-view
```

A single view, when the block is already present or you only need that view:

```bash
npx shadcn@latest add @retana/view-table
npx shadcn@latest add @retana/view-kanban
npx shadcn@latest add @retana/view-calendar
npx shadcn@latest add @retana/view-timeline
npx shadcn@latest add @retana/view-grouped-list
npx shadcn@latest add @retana/view-gallery
npx shadcn@latest add @retana/record-properties
npx shadcn@latest add @retana/multi-view-core
npx shadcn@latest add @retana/use-multi-view
```

Answer **no** if the CLI asks to overwrite a primitive the host already has, including `layered-panel` or `entity-form` when those files are already installed. The public registry host is not chosen yet. Until a domain exists, the URL form is `npx shadcn@latest add https://<your-deployment>/r/<name>.json`.

This is an independent implementation of the common multi-view pattern (one dataset shown as a table, board, calendar, timeline, list, or gallery).

## When to use which piece

- `multi-view` when the same records must switch views and share search, filter, sort, selection, and the record panel.
- `view-table` when columns come from a field schema and the same rows may also appear in other views. `data-table` remains the bookings admin, `crm-table` the fixed contact layout, and `adaptive-table` the width-adaptive grouped table.
- `view-kanban` for a status or select board over a field schema. `sortable-board` remains the homepage project board with category tabs.
- `view-timeline` for a start/end schedule. The catalog item `timeline` is an activity feed grouped by day.
- `view-grouped-list` for collapsible groups of compact rows. `adaptive-table` remains the width-adaptive grouped table.
- `view-gallery` for cards with a cover and quick chips.
- `record-properties` for a whole schema of editable rows, including inside `layered-panel`. `inline-edit` is a single field.

The toolbar is its own, built from host primitives. `filter-toolbar` and `segmented-control` stay separate pieces and are not imported here.

Answer **no** if `shadcn add` asks to overwrite a primitive the host already has (`button`, `table`, `dialog`, and the rest listed on the item).

## Supabase

```ts
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function load() {
  const { data, error } = await supabase.from("opportunities").select("*")
  if (error) throw error
  return data
}

const callbacks = {
  onRecordChange: async (id: string, patch: Record<string, unknown>) => {
    const { error } = await supabase.from("opportunities").update(patch).eq("id", id)
    if (error) throw error
  },
  onCreate: async (draft: Record<string, unknown>) => {
    const { error } = await supabase.from("opportunities").insert(draft)
    if (error) throw error
  },
  onDelete: async (ids: readonly string[]) => {
    const { error } = await supabase.from("opportunities").delete().in("id", [...ids])
    if (error) throw error
  },
  onMove: async (id: string, patch: Record<string, unknown>) => {
    const { error } = await supabase.from("opportunities").update(patch).eq("id", id)
    if (error) throw error
  },
}
```

Realtime refresh: subscribe to `postgres_changes` on the table and replace the `records` prop. Do not merge the payload inside the registry item.

```ts
supabase
  .channel("opportunities")
  .on("postgres_changes", { event: "*", schema: "public", table: "opportunities" }, () => {
    void load().then(setRecords)
  })
  .subscribe()
```

## REST

```ts
onRecordChange: async (id, patch) => {
  const response = await fetch(`/api/opportunities/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!response.ok) throw new Error("Could not save")
}
```

Use the same shape for `POST /api/opportunities`, `DELETE /api/opportunities?ids=`, and `PATCH` for moves. Throw on failure so the optimistic row returns.

## Field schemas

Opportunities: `name` text, `company` relation, `amount` currency, `stage` status, `owner` person, `close` date.

Projects: `name` text, `summary` text, `team` select, `health` status, `lead` person, `start`/`end` dates, `progress` progress.

Promotions: `name` text, `blurb` text, `channel` select, `state` status, `cover` image, `starts` date.
