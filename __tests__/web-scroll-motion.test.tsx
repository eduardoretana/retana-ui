import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { HERO_VIEW_TIMELINE_CSS, HeroViewTimeline, splitHeadline } from "@/registry/ui/hero-view-timeline"
import { chapterTimelineName, SCROLL_CHAPTERS_CSS, ScrollChapters } from "@/registry/ui/scroll-chapters"
import { SCROLL_REVEAL_GRID_CSS, SCROLL_REVEAL_GRID_RANGES, ScrollRevealGrid } from "@/registry/ui/scroll-reveal-grid"
import { morphAxis, VARIABLE_FONT_MORPH_CSS, VariableFontMorph } from "@/registry/ui/variable-font-morph"

const SHEETS = {
  "scroll-reveal-grid": SCROLL_REVEAL_GRID_CSS,
  "scroll-chapters": SCROLL_CHAPTERS_CSS,
  "hero-view-timeline": HERO_VIEW_TIMELINE_CSS,
  "variable-font-morph": VARIABLE_FONT_MORPH_CSS,
}

/** Rule bodies that declare animation-timeline, with the at-rules that wrap them. */
function timelineRules(css: string) {
  const rules: { body: string; context: string }[] = []
  const stack: string[] = []
  let head = ""
  let body = ""
  for (const ch of css) {
    if (ch === "{") {
      stack.push(head.trim())
      head = ""
      body = ""
    } else if (ch === "}") {
      const selector = stack.pop() ?? ""
      if (/animation-timeline\s*:/.test(body)) rules.push({ body, context: [...stack, selector].join(" | ") })
      body = ""
      head = ""
    } else {
      head += ch
      body += ch
    }
  }
  return rules
}

describe("web scroll motion: CSS contract (UIS-WEB-MOTION-001…005)", () => {
  for (const [name, css] of Object.entries(SHEETS)) {
    it(`${name}: guarded, ordered, and transform/opacity only`, () => {
      const rules = timelineRules(css)
      expect(rules.length).toBeGreaterThan(0)
      for (const rule of rules) {
        expect(rule.context).toMatch(/@media \(prefers-reduced-motion: no-preference\)/)
        expect(rule.context).toMatch(/@supports \(animation-timeline: (view|scroll)\(\)\)/)
        const shorthand = rule.body.search(/(^|[;\s])animation\s*:/)
        const timeline = rule.body.search(/animation-timeline\s*:/)
        if (shorthand >= 0) expect(shorthand).toBeLessThan(timeline)
      }
      const frames = [...css.matchAll(/@keyframes[^{]+\{([\s\S]*?)\n\}/g)].map((match) => match[1] ?? "")
      for (const frame of frames) {
        const props = [...frame.matchAll(/([a-z-]+)\s*:/g)].map((match) => match[1])
        for (const prop of props) expect(prop).toMatch(/^(opacity|transform|translate|scale|rotate|--[\w-]+)$/)
      }
      const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}\n/, "").replace(/@keyframes[\s\S]*?\n\}/g, "")
      expect(outside).not.toMatch(/opacity:\s*0[;\s]|visibility:\s*hidden/)
    })
  }
})

/**
 * Every animated element in these pieces carries text. Muted text in the theme sits close to 4.5:1 at full
 * opacity, so any opacity below 1 drops it under WCAG AA while the animation runs (axe color-contrast at
 * mid-entry and mid-exit). Motion moves text with transform only; opacity stays at 1 in every keyframe.
 */
const TEXT_MIN_OPACITY = 1

function keyframeOpacities(css: string) {
  const frames = [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\n\}/g)]
  return frames.flatMap((match) =>
    [...(match[2] ?? "").matchAll(/opacity\s*:\s*([\d.]+)/g)].map((value) => ({ name: match[1], value: Number(value[1]) })),
  )
}

describe("web scroll motion: text keeps AA contrast while it moves", () => {
  for (const [name, css] of Object.entries(SHEETS)) {
    it(`${name}: no keyframe fades text below opacity ${TEXT_MIN_OPACITY}`, () => {
      const faded = keyframeOpacities(css).filter((entry) => entry.value < TEXT_MIN_OPACITY)
      expect(faded).toEqual([])
    })
  }
})

describe("scroll-reveal-grid", () => {
  const items = [
    { id: "a", title: "Visita al taller", eyebrow: "Paso 1", description: "Elegimos la arcilla." },
    { id: "b", title: "Boceto y muestra" },
  ]

  it("renders every card visible in the DOM with the reveal ranges", () => {
    render(<ScrollRevealGrid items={items} />)
    const list = screen.getByRole("list")
    expect(list).toHaveAttribute("data-slot", "scroll-reveal-grid")
    expect(list).toHaveAttribute("data-motion", "auto")
    expect(within(list).getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByRole("heading", { level: 3, name: "Visita al taller" })).toBeInTheDocument()
    expect(SCROLL_REVEAL_GRID_CSS).toContain(SCROLL_REVEAL_GRID_RANGES.odd)
    expect(SCROLL_REVEAL_GRID_CSS).toContain(SCROLL_REVEAL_GRID_RANGES.even)
  })

  it("holds still with motion off and covers empty, loading, and error", () => {
    const { rerender } = render(<ScrollRevealGrid items={items} motion="off" headingAs="h4" />)
    expect(screen.getByRole("list")).toHaveAttribute("data-motion", "off")
    expect(screen.getByRole("heading", { level: 4, name: "Boceto y muestra" })).toBeInTheDocument()
    rerender(<ScrollRevealGrid labels={{ empty: "Todavía no hay pasos." }} />)
    expect(screen.getByText("Todavía no hay pasos.")).toBeInTheDocument()
    rerender(<ScrollRevealGrid loading labels={{ loading: "Cargando los pasos" }} />)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando los pasos")
    rerender(<ScrollRevealGrid items={items} error="No se cargaron los pasos." />)
    expect(screen.getByRole("alert")).toHaveTextContent("No se cargaron los pasos.")
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
  })
})

describe("scroll-chapters", () => {
  const chapters = [
    { id: "cap-barro", title: "El barro", content: <p>Se amasa a mano.</p> },
    { id: "Cap Torno!", title: "El torno", content: <p>Se centra primero.</p> },
  ]

  it("names one timeline per chapter and lifts them with timeline-scope", () => {
    expect(chapterTimelineName("cap-barro")).toBe("--retana-chapter-cap-barro")
    expect(chapterTimelineName("Cap Torno!")).toBe("--retana-chapter-cap-torno")
    expect(chapterTimelineName("¡!")).toBe("--retana-chapter-x")
    const { container } = render(<ScrollChapters chapters={chapters} labels={{ nav: "Capítulos" }} />)
    const root = container.querySelector('[data-slot="scroll-chapters"]') as HTMLElement
    expect(root.style.getPropertyValue("--retana-chapters-scope")).toBe("--retana-chapter-cap-barro, --retana-chapter-cap-torno")
    const sections = container.querySelectorAll('[data-slot="scroll-chapters-section"]')
    expect((sections[1] as HTMLElement).style.getPropertyValue("--retana-chapter-timeline")).toBe("--retana-chapter-cap-torno")
    expect(SCROLL_CHAPTERS_CSS).toContain("animation-timeline: scroll(nearest block)")
    expect(SCROLL_CHAPTERS_CSS).toContain("animation-range: contain 0% contain 100%")
  })

  it("keeps a real anchor index and labelled sections", () => {
    render(<ScrollChapters chapters={chapters} labels={{ nav: "Capítulos" }} />)
    const nav = screen.getByRole("navigation", { name: "Capítulos" })
    expect(within(nav).getByRole("link", { name: "El barro" })).toHaveAttribute("href", "#cap-barro")
    expect(screen.getByRole("region", { name: "El torno" })).toHaveAttribute("id", "Cap Torno!")
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2)
  })

  it("covers empty, loading, and error", () => {
    const { rerender } = render(<ScrollChapters />)
    expect(screen.getByText("No chapters yet.")).toBeInTheDocument()
    rerender(<ScrollChapters loading />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading")
    rerender(<ScrollChapters chapters={chapters} error="No se cargó la guía." />)
    expect(screen.getByRole("alert")).toHaveTextContent("No se cargó la guía.")
  })
})

describe("hero-view-timeline", () => {
  it("splits the headline at the middle word", () => {
    expect(splitHeadline("Vajillas por encargo hechas a mano")).toEqual(["Vajillas por encargo", "hechas a mano"])
    expect(splitHeadline("Uno dos tres")).toEqual(["Uno dos", "tres"])
    expect(splitHeadline("  Barro ")).toEqual(["Barro", ""])
  })

  it("keeps one accessible h1 and never animates in", () => {
    render(<HeroViewTimeline title="Vajillas por encargo hechas a mano" lead="Entregamos en dos semanas." actions={<a href="/visita">Agenda una visita</a>} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Vajillas por encargo hechas a mano")
    expect(screen.getByRole("link", { name: "Agenda una visita" })).toBeInTheDocument()
    expect(HERO_VIEW_TIMELINE_CSS).toContain("view-timeline: --retana-hero block")
    expect(HERO_VIEW_TIMELINE_CSS).toContain("exit 0% exit 70%")
    expect(HERO_VIEW_TIMELINE_CSS).not.toMatch(/entry|from \{/)
  })

  it("passes a custom range and covers empty, loading, and error", () => {
    const { container, rerender } = render(<HeroViewTimeline title="Barro y horno" range="exit 10% exit 60%" />)
    expect((container.querySelector("section") as HTMLElement).style.getPropertyValue("--retana-hero-range")).toBe("exit 10% exit 60%")
    rerender(<HeroViewTimeline labels={{ empty: "Agrega un titular." }} />)
    expect(screen.getByText("Agrega un titular.")).toBeInTheDocument()
    rerender(<HeroViewTimeline loading />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading")
    rerender(<HeroViewTimeline title="Barro y horno" actions={<button type="button">Ir</button>} error="No se cargó la agenda." />)
    expect(screen.getByRole("alert")).toHaveTextContent("No se cargó la agenda.")
    expect(screen.queryByRole("button", { name: "Ir" })).not.toBeInTheDocument()
  })
})

describe("variable-font-morph", () => {
  it("validates the axis tag", () => {
    expect(morphAxis("wght")).toBe("wght")
    expect(morphAxis("ELSH")).toBe("ELSH")
    expect(morphAxis("weight")).toBe("wght")
    expect(morphAxis(undefined)).toBe("wght")
  })

  it("registers the number, rests at `to`, and reserves the box with a hidden copy", () => {
    const { container } = render(<VariableFontMorph as="h2" text="Del barro al horno" axis="ELSH" from={1} to={80} />)
    const heading = screen.getByRole("heading", { level: 2, name: "Del barro al horno" })
    expect(heading).toHaveAttribute("data-axis", "ELSH")
    expect(heading.style.getPropertyValue("--retana-font-morph-axis")).toBe('"ELSH"')
    expect(heading.style.getPropertyValue("--retana-font-morph-to")).toBe("80")
    const copy = container.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(copy).toHaveClass("invisible")
    expect(copy.style.fontVariationSettings).toBe('"ELSH" 80')
    expect(VARIABLE_FONT_MORPH_CSS).toContain("@property --retana-font-morph")
    expect(VARIABLE_FONT_MORPH_CSS).toContain("--retana-font-morph: var(--retana-font-morph-to)")
  })

  it("drops the copy with reserve off and covers empty, loading, and error", () => {
    const { container, rerender } = render(<VariableFontMorph text="Eje" reserve={false} />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
    rerender(<VariableFontMorph />)
    expect(screen.getByText("No text to show.")).toBeInTheDocument()
    rerender(<VariableFontMorph loading />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading")
    rerender(<VariableFontMorph text="Eje" error="No se cargó la fuente." />)
    expect(screen.getByRole("alert")).toHaveTextContent("No se cargó la fuente.")
  })
})
