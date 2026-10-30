import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (path: string) => readFileSync(path, "utf8")

const inputs = [
  {
    file: "registry/blocks/crm.tsx",
    snippet: 'aria-label={`Empresa ${row.company}`}',
    className: "text-base focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:text-sm",
  },
  {
    file: "registry/blocks/crm.tsx",
    snippet: "aria-label={`Responsable de ${row.company}`}",
    className: "text-base focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:text-sm",
  },
  {
    file: "registry/blocks/crm.tsx",
    snippet: "aria-label={`Valor de ${row.company}`}",
    className: "text-right text-base tabular-nums focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:text-sm",
  },
  {
    file: "registry/blocks/onboarding.tsx",
    snippet: "value={invites}",
    className: "text-base focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:text-sm",
  },
  {
    file: "registry/blocks/pipeline-board.tsx",
    snippet: "aria-label={labels.from}",
    className: "text-base text-foreground md:text-sm",
  },
  {
    file: "registry/blocks/pipeline-board.tsx",
    snippet: "aria-label={labels.to}",
    className: "text-base text-foreground md:text-sm",
  },
  {
    file: "registry/ui/candidate-detail.tsx",
    snippet: "value={kind}",
    className: "text-base text-foreground md:text-sm",
  },
  {
    file: "registry/ui/candidate-detail.tsx",
    snippet: 'type="datetime-local"',
    className: "text-base text-foreground md:text-sm",
  },
  {
    file: "registry/ui/json-viewer.tsx",
    snippet: 'aria-label="Search JSON"',
    className: "text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring md:text-sm",
  },
  {
    file: "registry/ui/parameter-slider.tsx",
    snippet: "aria-label={label}",
    className: "font-mono text-base tabular-nums focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:text-sm",
  },
  {
    file: "registry/ui/view-calendar.tsx",
    snippet: 'type="month"',
    className: "text-base md:text-sm",
  },
] as const

describe("IDEA-448 inputs de 16 px", () => {
  it("marca los 11 controles nativos con text-base md:text-sm", () => {
    expect(inputs).toHaveLength(11)
    for (const item of inputs) {
      const source = read(item.file)
      const at = source.indexOf(item.snippet)
      expect(at, item.snippet).toBeGreaterThan(-1)
      const window = source.slice(Math.max(0, at - 250), at + 500)
      expect(window, item.file).toContain(item.className)
      expect(window, item.file).toContain("md:text-sm")
      expect(window, item.file).not.toMatch(/<(input|textarea)[^>]*\stext-sm\b/)
    }
  })
})

describe("IDEA-448 tap-highlight y viewport", () => {
  it("deja el tap-highlight transparente sin quitar el foco visible", () => {
    const css = read("app/globals.css")
    expect(css).toMatch(/html\s*\{[^}]*-webkit-tap-highlight-color:\s*transparent/)
    expect(css).toContain("outline-ring/50")
    expect(css).not.toMatch(/:focus-visible\s*\{[^}]*outline:\s*none/)
  })

  it("exporta viewport-fit cover sin bloquear el zoom", () => {
    const layout = read("app/layout.tsx")
    expect(layout).toContain('viewportFit: "cover"')
    expect(layout).toContain('width: "device-width"')
    expect(layout).toContain("initialScale: 1")
    expect(layout).not.toContain("maximumScale")
    expect(layout).not.toMatch(/userScalable/)
  })
})

describe("IDEA-448 bounce-easing", () => {
  const files = [
    "registry/ui/theme-toggles/eclipse.tsx",
    "registry/ui/theme-toggles/expand.tsx",
    "registry/ui/theme-toggles/inner-moon.tsx",
    "registry/ui/theme-toggles/light-switch.tsx",
    "registry/ui/theme-toggles/simple.tsx",
    "registry/ui/theme-toggles/within.tsx",
  ]

  it("usa la curva sin overshoot y conserva reduced-motion", () => {
    for (const file of files) {
      const source = read(file)
      expect(source, file).toContain("cubic-bezier(0.22,1,0.36,1)")
      expect(source, file).toContain("motion-safe:")
      expect(source, file).not.toMatch(/cubic-bezier\([^)]*,\s*1\.\d+\)/)
      expect(source, file).not.toContain("transition-all")
    }
  })
})
