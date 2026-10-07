import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react")
  return { ...actual, useReducedMotion: () => true }
})

import { ScrollProgress } from "@/registry/ui/scroll-progress"

describe("ScrollProgress reduced motion", () => {
  it("draws the reading bar without a motion node", () => {
    render(<ScrollProgress label="Lectura" />)
    expect(document.querySelector("[data-slot='scroll-progress-bar']")).toHaveAttribute("data-reduced", "true")
  })
})
