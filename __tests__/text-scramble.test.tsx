import { readFileSync } from "node:fs"
import { join } from "node:path"

import { act, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { setMotionPreference } from "@/registry/ui/motion-preference"
import {
  SCRAMBLE_GLYPHS,
  SCRAMBLE_MAX_CHARS,
  SCRAMBLE_TICK_MS,
  TextScramble,
  scrambleDuration,
  scrambleFrame,
  scrambleSchedule,
} from "@/registry/ui/text-scramble"

const root = process.cwd()
const HERO = "Consola Cobre 84: lista para enviar"

afterEach(() => {
  setMotionPreference("system")
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function useFakeClock() {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "setTimeout", "clearTimeout", "Date"] })
}

const noiseOf = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>("[data-slot='text-scramble-noise']"))
const finalsOf = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>("[data-slot='text-scramble-final']"))

describe("TextScramble", () => {
  it("TS-FRAME: progress 0 hides every glyph, progress 1 is the text, and spaces never move", () => {
    const schedule = scrambleSchedule(HERO)
    const start = Array.from(scrambleFrame(HERO, 0, schedule, 0))
    const chars = Array.from(HERO)
    expect(start).toHaveLength(chars.length)
    chars.forEach((char, i) => {
      if (char === " ") expect(start[i]).toBe(" ")
      else expect(SCRAMBLE_GLYPHS).toContain(start[i])
    })
    expect(scrambleFrame(HERO, 1, schedule, 99)).toBe(HERO)
    // A glyph that has locked in stays locked as progress grows.
    let previous = new Set<number>()
    for (const p of [0.2, 0.4, 0.6, 0.8, 1]) {
      const frame = Array.from(scrambleFrame(HERO, p, schedule, Math.round(p * 20)))
      const locked = new Set(chars.flatMap((char, i) => (char !== " " && schedule[i] <= p && frame[i] === char ? [i] : [])))
      for (const i of previous) expect(locked.has(i)).toBe(true)
      previous = locked
    }
  })

  it("TS-SCHEDULE: reading order with uneven gaps, everything locked by the end", () => {
    const schedule = scrambleSchedule(HERO)
    const letters = schedule.filter((_, i) => HERO[i] !== " ")
    expect(Math.max(...letters)).toBeLessThanOrEqual(1)
    expect(Math.min(...letters)).toBeGreaterThan(0)
    expect(letters[0]).toBeLessThan(letters[letters.length - 1])
    const gaps = letters.slice(1).map((t, i) => Number((t - letters[i]).toFixed(4)))
    expect(new Set(gaps).size).toBeGreaterThan(3)
    expect(scrambleSchedule(HERO)).toEqual(schedule)
  })

  it("TS-A11Y: one clean accessible name, noise hidden, no live region", () => {
    render(<TextScramble as="h1" trigger="mount" text={HERO} />)
    const heading = screen.getByRole("heading", { level: 1, name: HERO })
    expect(heading.querySelector(".sr-only")).toHaveTextContent(HERO)
    expect(heading.querySelector("[data-slot='text-scramble-visual']")).toHaveAttribute("aria-hidden", "true")
    expect(heading.querySelector("[aria-live]")).toBeNull()
    expect(heading).not.toHaveAttribute("aria-live")
    expect(heading).not.toHaveAttribute("role")
  })

  it("TS-NOJS: server HTML already carries the final words; no layout jump when noise runs", () => {
    const html = renderToString(<TextScramble as="h2" trigger="mount" text="Horno abierto" />)
    expect(html).toContain("Horno")
    expect(html).toContain("abierto")
    expect(html).toContain('data-state="idle"')
    // The noise sits on top of the final word (absolute), so the line box is the final text's.
    const { container } = render(<TextScramble trigger="mount" text="Horno abierto" />)
    for (const noise of noiseOf(container)) expect(noise.className).toMatch(/\babsolute\b/)
    expect(finalsOf(container).map((node) => node.textContent)).toEqual(["Horno", "abierto"])
  })

  it("TS-REDUCED: reduced motion shows the final text at once, schedules no frame, calls onDecoded once", () => {
    setMotionPreference("reduce")
    const raf = vi.spyOn(window, "requestAnimationFrame")
    const onDecoded = vi.fn()
    const { container } = render(<TextScramble trigger="mount" text={HERO} onDecoded={onDecoded} />)
    const node = container.querySelector("[data-slot='text-scramble']")
    expect(node).toHaveAttribute("data-state", "done")
    expect(node).toHaveAttribute("data-reduced", "true")
    expect(raf).not.toHaveBeenCalled()
    expect(noiseOf(container).every((noise) => noise.textContent === "")).toBe(true)
    expect(onDecoded).toHaveBeenCalledTimes(1)
  })

  it("TS-THROTTLE: at most one write per tick, no layout reads while running, done on time", () => {
    useFakeClock()
    const rect = vi.spyOn(Element.prototype, "getBoundingClientRect")
    const onDecoded = vi.fn()
    const { container } = render(<TextScramble trigger="mount" duration={600} text={HERO} onDecoded={onDecoded} />)
    const node = container.querySelector("[data-slot='text-scramble']")!
    const writes = new Map<HTMLElement, number>()
    for (const noise of noiseOf(container)) {
      let value = noise.textContent ?? ""
      writes.set(noise, 0)
      Object.defineProperty(noise, "textContent", {
        configurable: true,
        get: () => value,
        set: (next: string) => {
          value = next
          writes.set(noise, (writes.get(noise) ?? 0) + 1)
        },
      })
    }
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(node).toHaveAttribute("data-state", "running")
    const ticks = Math.ceil(300 / SCRAMBLE_TICK_MS) + 2
    for (const count of writes.values()) expect(count).toBeLessThanOrEqual(ticks)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(node).toHaveAttribute("data-state", "done")
    expect(onDecoded).toHaveBeenCalledTimes(1)
    expect(rect).not.toHaveBeenCalled()
    expect(noiseOf(container).every((noise) => noise.textContent === "")).toBe(true)
  })

  it("TS-ONCE: plays once; a new text after it ends appears without noise", () => {
    useFakeClock()
    const { container, rerender } = render(<TextScramble trigger="mount" duration={300} text="Horno abierto" />)
    act(() => {
      vi.advanceTimersByTime(500)
    })
    const node = container.querySelector("[data-slot='text-scramble']")!
    expect(node).toHaveAttribute("data-state", "done")
    const raf = vi.spyOn(window, "requestAnimationFrame")
    rerender(<TextScramble trigger="mount" duration={300} text="Horno cerrado" />)
    expect(node).toHaveAttribute("data-state", "done")
    expect(raf).not.toHaveBeenCalled()
    expect(finalsOf(container).map((n) => n.textContent)).toEqual(["Horno", "cerrado"])
  })

  it("TS-CANCEL: unmounting mid-run cancels the frame loop", () => {
    useFakeClock()
    const cancel = vi.spyOn(window, "cancelAnimationFrame")
    const onDecoded = vi.fn()
    const { unmount } = render(<TextScramble trigger="mount" duration={600} text={HERO} onDecoded={onDecoded} />)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    unmount()
    expect(cancel).toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onDecoded).not.toHaveBeenCalled()
  })

  it("TS-VISIBLE: trigger visible waits for the viewport and observes only once", () => {
    useFakeClock()
    let fire: ((visible: boolean) => void) | null = null
    const disconnect = vi.fn()
    const Original = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        fire = (visible) => callback([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
      }
      observe() {}
      unobserve() {}
      disconnect = disconnect
      takeRecords() {
        return []
      }
      root = null
      rootMargin = ""
      thresholds = []
    } as unknown as typeof IntersectionObserver
    try {
      const { container } = render(<TextScramble text={HERO} />)
      const node = container.querySelector("[data-slot='text-scramble']")!
      expect(node).toHaveAttribute("data-trigger", "visible")
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(node).toHaveAttribute("data-state", "idle")
      act(() => fire?.(true))
      expect(node).toHaveAttribute("data-state", "running")
      expect(disconnect).toHaveBeenCalled()
    } finally {
      globalThis.IntersectionObserver = Original
    }
  })

  it("TS-LIMITS: long copy and empty copy skip the effect; duration is clamped", () => {
    const long = "a".repeat(SCRAMBLE_MAX_CHARS + 1)
    const { container } = render(<TextScramble trigger="mount" text={long} />)
    const node = container.querySelector("[data-slot='text-scramble']")!
    expect(node).toHaveAttribute("data-state", "done")
    expect(node).toHaveAttribute("data-skipped", "length")
    const empty = render(<TextScramble trigger="mount" text="   " />)
    expect(empty.container.querySelector("[data-slot='text-scramble']")).toHaveAttribute("data-state", "done")
    expect(scrambleDuration(50)).toBe(300)
    expect(scrambleDuration(5000)).toBe(1200)
    expect(scrambleDuration(Number.NaN)).toBe(600)
    expect(scrambleDuration(undefined)).toBe(600)
  })

  it("TS-TOKENS: theme tokens only, named transitions, no state per frame", () => {
    const source = readFileSync(join(root, "registry/ui/text-scramble.tsx"), "utf8")
    expect(source).not.toMatch(/transition-all|transition:\s*all/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/\bdark:/)
    expect(source).toContain("text-muted-foreground")
    expect(source).toContain("prefers-reduced-motion")
    const loop = source.slice(source.indexOf("const step ="), source.indexOf("// end step"))
    expect(loop.length).toBeGreaterThan(0)
    expect(loop).not.toMatch(/\bset[A-Z]\w*\(/)
  })

  it("TS-PLP: registry item opts into PLP with scenes, preview and credits", () => {
    const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8")) as {
      items: { name: string; meta?: { scenes?: (string | { id: string })[]; preview?: string; titleEs?: string }; docs?: string; registryDependencies?: string[] }[]
    }
    const item = registry.items.find((entry) => entry.name === "text-scramble")
    expect(item).toBeDefined()
    const ids = (item?.meta?.scenes ?? []).map((scene) => (typeof scene === "string" ? scene : scene.id))
    for (const id of ["filled", "empty", "loading", "error"]) expect(ids).toContain(id)
    expect(item?.meta?.preview).toBe("app/examples/text-scramble/preview.tsx")
    expect(item?.registryDependencies).toContain("@retana/motion-preference")
    expect(item?.docs).toMatch(/Emil Kowalski/)
    expect(readFileSync(join(root, "app/examples/text-scramble/preview.tsx"), "utf8")).toContain("ScenePreview")
    expect(readFileSync(join(root, "app/examples/text-scramble/demo.tsx"), "utf8")).toContain("SceneDeck")
  })
})

describe("TextScramble break-ui", () => {
  it("TS-BREAK-SWAP: new copy mid-decode stops the noise and shows the new words", () => {
    useFakeClock()
    const { container, rerender } = render(<TextScramble trigger="mount" duration={1000} text="Horno abierto" />)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    rerender(<TextScramble trigger="mount" duration={1000} text="Cierre a las nueve de la noche" />)
    act(() => {
      vi.advanceTimersByTime(60)
    })
    const node = container.querySelector("[data-slot='text-scramble']")!
    expect(node).toHaveAttribute("data-state", "done")
    expect(noiseOf(container).every((noise) => noise.textContent === "")).toBe(true)
    expect(finalsOf(container).map((n) => n.textContent).join(" ")).toBe("Cierre a las nueve de la noche")
  })

  it("TS-BREAK-UNICODE: accents, ñ, emoji and RTL keep their length and come back intact", () => {
    for (const text of ["Año nuevo, señal más clara", "Listo 🚀 ya", "مرحبا بالعالم", "x"]) {
      const schedule = scrambleSchedule(text)
      expect(schedule).toHaveLength(Array.from(text).length)
      expect(Array.from(scrambleFrame(text, 0.5, schedule, 3))).toHaveLength(Array.from(text).length)
      expect(scrambleFrame(text, 1, schedule, 3)).toBe(text)
    }
  })

  it("TS-BREAK-CHARSET: an empty charset falls back to the default glyphs", () => {
    const frame = scrambleFrame("Horno", 0, scrambleSchedule("Horno"), 1, "")
    for (const char of frame) expect(SCRAMBLE_GLYPHS).toContain(char)
  })

  it("TS-BREAK-DELAY: a negative or NaN delay starts right away", () => {
    useFakeClock()
    const { container } = render(<TextScramble trigger="mount" duration={300} delay={Number.NaN} text="Horno abierto" />)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(container.querySelector("[data-slot='text-scramble']")).toHaveAttribute("data-state", "done")
  })
})
