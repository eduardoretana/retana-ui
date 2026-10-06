import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import * as piece from "@/registry/ui/presence-outline"
import Preview from "@/app/examples/presence-outline/preview"

describe("presence-outline", () => {
  it("loads the registry module and renders its preview", () => {
    expect(Object.keys(piece).length).toBeGreaterThan(0)
    expect(() => render(<Preview />)).not.toThrow()
  })
})
