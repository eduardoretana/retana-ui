# Contributing

Registry items in this repo are installed into existing apps (CRMs, ops portals, the clinic app). Each of those apps already has a shadcn theme. A new item must inherit that theme.

## Inherit the host, bring no theme

- Do not ship a theme. No CSS variables, no color, font, radius, or shadow tokens, no Tailwind config or `@theme` changes, no `cssVars` on the registry item, and no global CSS file.
- Style only with the standard shadcn semantic classes: `bg-background`, `bg-popover`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border`, `border-border`, `ring`, `accent`, `primary`, `shadow-*`, and `rounded-*`. Those classes resolve to the host's tokens, including dark mode.
- Reuse the host's primitives through `registryDependencies` (`button`, `badge`, `scroll-area`, `separator`, and so on). Do not copy those files into `registry/` and do not edit their variants to match a mock.
- `shadcn add` asks before it overwrites a file that already exists. Document that the answer is **no** for any primitive the host already has. Only the new item's files should be written.
- Prefer props over hard-coded sizes. Widths, labels, and a `className` (or a named slot class) on every part belong in the public API, with a sensible default.
- The demo site may define its own theme so the preview is readable. Keep that theme in `app/` (`app/globals.css`, `app/layout.tsx`). Do not import it from anything under `registry/`.

`registry.json` should list `dependencies` and `registryDependencies` the item actually imports, and nothing else. Run `pnpm registry:build` so `public/r/*.json` stays in sync. The built JSON must not contain a `cssVars` key.
