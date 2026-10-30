import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react")
  return { ...actual, useReducedMotion: () => true }
})

import { CollectionViews } from "@/registry/ui/collection-views"

describe("CollectionViews reduced motion", () => {
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia
  })

  it("crossfades and does not share layout ids", () => {
    render(
      <CollectionViews
        today="2026-10-30"
        groups={[{ id: "banco", label: "En el banco" }]}
        items={[{ id: "jarron", groupId: "banco", title: "Jarrón cobalto", start: "2026-10-27", end: "2026-11-02" }]}
        onItemOpen={() => undefined}
      />,
    )
    expect(screen.getByText("Jarrón cobalto")).toBeInTheDocument()
    expect(document.querySelector("[data-slot='collection-views']")).toHaveAttribute("data-motion", "crossfade")
    expect(document.querySelector("[data-shared]")).toBeNull()
  })
})
