import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import * as piece from "@/registry/ui/document-list"
import Preview from "@/app/examples/document-list/preview"

describe("document-list", () => {
  it("loads the registry module and renders its preview", () => {
    expect(Object.keys(piece).length).toBeGreaterThan(0)
    expect(() => render(<Preview />)).not.toThrow()
  })
})
