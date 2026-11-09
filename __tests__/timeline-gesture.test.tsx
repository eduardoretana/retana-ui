import { readFileSync } from "node:fs"
import path from "node:path"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { FieldDef, MultiRecord } from "@/registry/lib/multi-view"
import { ViewTimeline } from "@/registry/ui/view-timeline"

const fields: FieldDef[] = [
  { id: "name", label: "Name", type: "text", icon: "text", section: "Deal" },
  { id: "start", label: "Start", type: "date", section: "Schedule" },
  { id: "end", label: "End", type: "date", section: "Schedule" },
]

const rows: MultiRecord[] = [
  { id: "a", name: "Bruma", start: "2026-04-01", end: "2026-04-10" },
]

function bar() {
  return screen.getByRole("button", { name: /Bruma/ })
}

function reduceMotion() {
  const original = window.matchMedia
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
  return () => {
    window.matchMedia = original
  }
}

describe("view-timeline gesture", () => {
  it("la barra sigue el dedo y confirma al soltar", () => {
    const onMove = vi.fn()
    render(
      <ViewTimeline
        records={rows}
        fields={fields}
        config={{ id: "time", kind: "timeline", label: "Timeline", titleField: "name", startField: "start", endField: "end" }}
        locale="en-US"
        today="2026-04-03"
        zoom="day"
        onMove={onMove}
      />,
    )
    const node = bar()
    fireEvent.pointerDown(node, { button: 0, pointerId: 1, pointerType: "mouse", clientX: 100, clientY: 12 })
    fireEvent.pointerMove(node, { pointerId: 1, pointerType: "mouse", clientX: 130, clientY: 12 })
    expect(node.style.transform).toBe("translate3d(30px, 0, 0)")
    expect(onMove).not.toHaveBeenCalled()
    fireEvent.pointerUp(node, { pointerId: 1, pointerType: "mouse", clientX: 130, clientY: 12 })
    expect(onMove).toHaveBeenCalled()
    expect(node.style.transform).toBe("")
  })

  it("con reduced motion el dedo sigue", () => {
    const restore = reduceMotion()
    try {
      render(
        <ViewTimeline
          records={rows}
          fields={fields}
          config={{ id: "time", kind: "timeline", label: "Timeline", titleField: "name", startField: "start", endField: "end" }}
          locale="en-US"
          today="2026-04-03"
          zoom="day"
        />,
      )
      const node = bar()
      fireEvent.pointerDown(node, { button: 0, pointerId: 4, pointerType: "mouse", clientX: 10, clientY: 8 })
      fireEvent.pointerMove(node, { pointerId: 4, pointerType: "mouse", clientX: 40, clientY: 8 })
      expect(node.style.transform).toBe("translate3d(30px, 0, 0)")
    } finally {
      restore()
    }
  })

  it("declara touch-pan-y porque el arrastre es horizontal", () => {
    render(
      <ViewTimeline
        records={rows}
        fields={fields}
        config={{ id: "time", kind: "timeline", label: "Timeline", titleField: "name", startField: "start", endField: "end" }}
        locale="en-US"
        today="2026-04-03"
        zoom="day"
      />,
    )
    expect(bar().className).toMatch(/touch-pan-y/)
  })

  it("las escenas PLP exportan dragging, dismissed y reduced", () => {
    const source = readFileSync(path.join(process.cwd(), "app/examples/view-timeline/scenes.tsx"), "utf8")
    expect(source).toMatch(/"dragging"/)
    expect(source).toMatch(/"dismissed"/)
    expect(source).toMatch(/"reduced"/)
  })
})
