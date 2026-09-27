# Retana UI

Shared [shadcn/ui](https://ui.shadcn.com) registry for Eduardo's projects, licensed under [MIT](LICENSE). The first item is **Layered Panel**: a detail surface that opens as a peek sheet and expands in place. The page behind it never changes route, so scroll position and table context stay put.

Every item inherits the host project's existing shadcn theme and ships no theme of its own. That rule is in [CONTRIBUTING.md](CONTRIBUTING.md).

The site is a catalog. `registry.json` is the source of truth for `/` and for `/items/[name]`.

Besides Layered Panel, the registry includes original chat, form, and media pieces (`chat-message`, `message-list`, `chat-composer`, `streaming-text`, `reasoning-steps`, `task-list`, `plan-card`, `question-card`, `inline-citation`, `code-block`, `file-diff`, `image-generation`, `ai-document`, `otp-field`, `dissolve-input`, `multi-select`, `color-picker`, `color-palette`, `magnetic-dropzone`, `gooey-slider`, `video-player`, `lightbox`, `logo-marquee`, `halftone-image`, `attachment-chip`, `marker`, `press-sound`, `crm-table`). They are clean-room implementations: common behaviors, new code, and the host theme. `crm-table` can stand alone or pass `crmColumnDefs()` into `AdminDataTable` when that item is installed.

- `/` — catalog index (search, type, category)
- `/items/layered-panel` — preview, install command, API, and source
- `/examples/layered-panel/team` — team directory example
- `/examples/layered-panel/lead` — CRM lead example, Spanish labels
- `/docs` — how to install the registry, the `@retana` namespace, and optional `REGISTRY_TOKEN`

`/leads` redirects to the lead example.

## Install

Pick one of the three paths below. All of them assume the target app is Next.js (App Router), Tailwind v4, and shadcn/ui (Radix preset). The registry files under `/r` are meant to be public.

In production, `proxy.ts` fails closed. `/r/*` returns 401 unless you set `REGISTRY_PUBLIC=true`, or you set `REGISTRY_TOKEN` and the client sends `Authorization: Bearer <token>`. `REGISTRY_TOKEN` is optional: use it only when a deployment should gate `/r/*`. `REGISTRY_PUBLIC=true` is the explicit opt-in that serves the registry with no token. In development, `/r/*` is served with no token. If `REGISTRY_TOKEN` is set, a matching bearer is still required.

### 1. Deploy, then install from the URL

Deploy this app (Vercel or anywhere that serves `public/`). The build writes the registry item to `public/r/layered-panel.json`.

```bash
npx shadcn@latest add https://<your-deployment>/r/layered-panel.json
```

Local check while this app is running:

```bash
npx shadcn@latest add http://localhost:3000/r/layered-panel.json
```

To publish the files with no token, set `REGISTRY_PUBLIC=true` on the production deployment. To gate them instead, set `REGISTRY_TOKEN` and pair it with the namespaced config below.

### 2. Namespaced registry (recommended for several apps)

In the target project's `components.json`:

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

Put the token in `.env.local` only when the deployment gates `/r/*` (the shadcn CLI substitutes `${REGISTRY_TOKEN}`). When `REGISTRY_PUBLIC=true` and no token is set, drop the `headers` block.

```bash
npx shadcn@latest add @retana/layered-panel
```

You can also register the namespace from the CLI:

```bash
npx shadcn@latest registry add @retana=https://<your-deployment>/r/{name}.json
```

### 3. Copy the source

Copy these two files and fix the imports only if your aliases differ:

| Source | Installs to |
| --- | --- |
| `registry/ui/layered-panel.tsx` | `components/ui/layered-panel.tsx` |
| `registry/hooks/use-layered-panel-url-state.ts` | `hooks/use-layered-panel-url-state.ts` |

The panel imports `button`, `scroll-area`, and `separator` from `@/components/ui`, plus `cn` from `@/lib/utils`. It does not ship copies of those primitives. npm packages: `radix-ui`, `lucide-react`. The URL hook is the only file that imports `next/navigation`. Skip it if you do not want the query string.

`npx shadcn add` prompts before overwriting a file that is already in the target app. When it asks about `button`, `scroll-area`, or `separator`, answer **no**. That keeps the host's versions, variants, and radius. Only the new `layered-panel` files should be written.

The panel talks to Radix through `import { Dialog } from "radix-ui"` (current shadcn). If a project still uses the old package, switch that one import to `import * as Dialog from "@radix-ui/react-dialog"`. The `Dialog.Root` / `Dialog.Content` API is the same.

## Three steps

1. Install the item (command above). shadcn adds the two files and asks for any registry dependency that already exists (`button`, `scroll-area`, `separator`). Answer **no** so the host project keeps its own primitives.
2. Render the panel **on the same page** as the table. Summary goes in `Peek`, the long record goes in `Full`.
3. On row click, open that id. Wire the optional URL hook if the link should be shareable.

```tsx
"use client"

import { LayeredPanel, DetailSection, DetailField } from "@/components/ui/layered-panel"
import { useLayeredPanelUrlState } from "@/hooks/use-layered-panel-url-state"

export function Members({ rows }: { rows: { id: string; name: string; email: string }[] }) {
  const panel = useLayeredPanelUrlState({ param: "member", viewParam: "view" })
  const member = rows.find((row) => row.id === panel.id)

  return (
    <>
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onClick={() => panel.openItem(row.id)}>
              <td>{row.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <LayeredPanel
        open={panel.open}
        onOpenChange={panel.onOpenChange}
        mode={panel.mode}
        onModeChange={panel.onModeChange}
        title={member?.name ?? "Details"}
      >
        <LayeredPanel.Header>
          <h2 className="text-base font-semibold">{member?.name}</h2>
        </LayeredPanel.Header>
        <LayeredPanel.ExpandToggle
          expandLabel="View full profile"
          collapseLabel="Close profile"
        />
        <LayeredPanel.Peek>
          <p className="px-5 pb-6 text-sm">Short summary for {member?.name}.</p>
        </LayeredPanel.Peek>
        <LayeredPanel.Full>
          <DetailSection title="Personal information">
            <DetailField label="Email" value={member?.email} />
          </DetailSection>
        </LayeredPanel.Full>
      </LayeredPanel>
    </>
  )
}
```

`Header` and `ExpandToggle` sit at the top of the peek column and move into the left column when the panel expands. They can be rendered from a child component that returns a fragment. A wrapping element needs `className="contents"` so the slots stay on the panel grid. Put a header inside `Peek` or `Full` only when it should stay in that column.

Without the URL hook, use `useState` for `open` and `mode`. Both controlled and uncontrolled usage work (`defaultOpen`, `defaultMode`).

## API

| Piece | Role |
| --- | --- |
| `LayeredPanel` | Dialog shell. Props: `open`, `defaultOpen`, `onOpenChange`, `mode` (`"peek"` \| `"full"`), `defaultMode`, `onModeChange`, `title`, `description`, `closeLabel`, `mobilePeekLabel`, `mobileFullLabel`, `peekWidth` (default `26.25rem`), `fullWidth` (default `70vw`), `showClose`, `className`, `overlayClassName`, `closeClassName`, `tabsClassName`, `tabClassName`, `gridClassName`. |
| `LayeredPanel.Peek` | Always the right column. The only column in peek mode. `className` on the column, `contentClassName` on the inner stack. |
| `LayeredPanel.Full` | Left column. Mounted, but hidden and inert until `mode="full"`. `className` and `contentClassName`, same as Peek. |
| `LayeredPanel.Header` | Grid slot at the top of the primary column. A child component can return it inside a fragment; a wrapping element needs `className="contents"`. |
| `LayeredPanel.ExpandToggle` | `expandLabel` (default `View full profile`), `collapseLabel` (default `Close profile`). Sets `aria-expanded`. Same grid placement as `Header`. `className` is the wrapper; `buttonClassName` merges onto the host `Button` without changing its variant. |
| `LayeredPanel.Section` / `DetailSection` | Uppercase section label, optional icon, top separator. `className`, `contentClassName`, `titleClassName`. |
| `LayeredPanel.Field` / `DetailField` | Label, optional icon, `value` or children, optional `href`. `className`, `labelClassName`, `valueClassName`. |
| `useLayeredPanel()` | Mode and setters from inside the panel. Throws outside of it. |
| `useLayeredPanelUrlState({ param, viewParam, fullValue })` | Returns `id`, `open`, `mode`, `openItem(id)`, `close()`, `setMode`, `onOpenChange`, `onModeChange`. |

Widths accept a single CSS length (`26.25rem`, `70vw`, `640px`). Anything else is ignored and the default is used. Default peek width is `26.25rem` (420px). Default expanded width is `70vw`.

## URL sync

```tsx
const panel = useLayeredPanelUrlState({ param: "member", viewParam: "view" })
```

| Action | URL | History |
| --- | --- | --- |
| Click a row | `?member=emma` | push |
| View full profile | `?member=emma&view=full` | push |
| Browser Back | `?member=emma` | peek |
| Browser Back again | no panel params | closed |
| Close (X), click-outside, or Esc from peek | previous page URL | `history.go` back across the entries this hook pushed |
| Land directly on `?member=emma&view=full` | Esc replaces to peek (does not leave the site) | replace |

Other query params on the page are preserved. Pass `scroll: false` is unnecessary: the hook uses `history.pushState`, which Next.js App Router syncs with `useSearchParams` and does not reset scroll.

Wrap the client component in `<Suspense>` because `useSearchParams` opts the route out of static prerendering up to that boundary.

Spanish labels are props, not a locale file:

```tsx
<LayeredPanel closeLabel="Cerrar" mobilePeekLabel="Resumen" mobileFullLabel="Ficha">
  <LayeredPanel.ExpandToggle expandLabel="Ver ficha completa" collapseLabel="Cerrar ficha" />
</LayeredPanel>
```

The `/leads` demo is that setup.

## Wire it to a data table

The panel does not know about rows. Give it an id from the click handler.

shadcn Data Table (TanStack Table): the row renderer already receives the row. Add the click there and do not navigate.

```tsx
<TableRow
  data-state={row.getIsSelected() && "selected"}
  className="cursor-pointer"
  onClick={() => panel.openItem(row.original.id)}
>
  {row.getVisibleCells().map((cell) => (
    <TableCell key={cell.id}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  ))}
</TableRow>
```

Keep links inside the row from bubbling (`onClick={(event) => event.stopPropagation()}`) if a cell has its own action. Keyboard: the demos use `tabIndex={0}` and Enter / Space on the row. A button in the name cell works too.

## Mobile

Below **1024px** the panel is a full-screen sheet. Peek and full become tabs (`mobilePeekLabel` / `mobileFullLabel`, defaults Overview / Profile) instead of two narrow columns. The expand button still switches mode. Esc still collapses, then closes. Each column scrolls on its own, and the sheet respects the safe-area inset.

From 1024px up, full mode is two columns: profile on the left, peek pinned on the right at the peek width. The panel width animates between the two sizes (280ms, `cubic-bezier(0.32, 0.72, 0, 1)`). Open and close slide in from the right. `prefers-reduced-motion: reduce` disables both. Buttons scale to `0.96` while pressed.

## Theming

Registry items inherit the host project. They bring no theme of their own. See [CONTRIBUTING.md](CONTRIBUTING.md).

`layered-panel` has no `cssVars`, no global CSS, and no color, font, radius, or shadow tokens. It only uses shadcn semantic classes (`bg-background`, `bg-foreground`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `shadow-lg`, `rounded-lg` / `rounded-l-xl`) and the host's `Button`, `ScrollArea`, and `Separator`. Light and dark mode follow whatever `.dark` and CSS variables the host already defines. `peekWidth` and `fullWidth` default to `26.25rem` and `70vw`; every slot accepts a `className` override.

The demo's theme lives in `app/globals.css` and `app/layout.tsx` only, so this site can be previewed. Status chips and capacity bars in `components/demo` are sample UI. They are not part of the registry item.

## Accessibility

- Radix Dialog: focus trap, scroll lock, `role="dialog"`, visually hidden title and description.
- Esc in full mode collapses to peek and keeps focus in the dialog. The next Esc closes and returns focus to the row that opened it.
- Click-outside and the close button dismiss the whole panel. `closeLabel` sets the button's accessible name (default `Close`).
- The idle full column is `inert`, so it stays out of the tab order and the accessibility tree.
- `ExpandToggle` exposes `aria-expanded`. Mobile tabs use `aria-pressed`.
- Columns use ScrollArea, so each side scrolls without moving the page underneath.

## Develop

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

`pnpm registry:build` validates the registry, runs `shadcn build`, and regenerates `lib/generated/preview-map.tsx`. `pnpm build` runs that first. Adding an item is the checklist in [CONTRIBUTING.md](CONTRIBUTING.md).

## Inicio rápido (español)

1. En el proyecto destino, registra el namespace en `components.json` (sección 2, arriba) o despliega este repo y usa la URL de `/r/layered-panel.json`.
2. Instala:

```bash
npx shadcn@latest add @retana/layered-panel
```

3. En la misma página de la tabla, abre el panel al hacer clic en la fila. El contenido largo va en `Full`; el resumen se queda en `Peek`. Para español, pasa las etiquetas:

```tsx
const panel = useLayeredPanelUrlState({ param: "lead", viewParam: "view" })

<LayeredPanel
  open={panel.open}
  onOpenChange={panel.onOpenChange}
  mode={panel.mode}
  onModeChange={panel.onModeChange}
  closeLabel="Cerrar"
  mobilePeekLabel="Resumen"
  mobileFullLabel="Ficha"
  title={lead.nombre}
>
  <LayeredPanel.ExpandToggle
    expandLabel="Ver ficha completa"
    collapseLabel="Cerrar ficha"
  />
  <LayeredPanel.Peek>{/* resumen */}</LayeredPanel.Peek>
  <LayeredPanel.Full>
    <DetailSection title="Información personal">
      <DetailField label="Correo" value={lead.correo} />
    </DetailSection>
  </LayeredPanel.Full>
</LayeredPanel>
```

`?lead=<id>` abre el resumen. `&view=full` abre la ficha. Atrás del navegador primero contrae y después cierra. El ejemplo vivo está en `/examples/layered-panel/lead`. El catálogo está en `/`.

El componente no trae tema: usa los tokens y los primitivos shadcn del proyecto anfitrión. Si el CLI pregunta si debe sobrescribir `button`, `scroll-area` o `separator`, responde que no.
