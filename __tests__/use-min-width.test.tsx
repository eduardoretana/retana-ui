import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useMinWidth } from "@/registry/hooks/use-min-width"

afterEach(() => {
  vi.restoreAllMocks()
})

function Probe({ px }: { px: number }) {
  const wide = useMinWidth(px)
  return <p>{wide ? "ancho" : "estrecho"}</p>
}

describe("useMinWidth", () => {
  it("matches a min-width query and starts narrow when the query does not", () => {
    render(<Probe px={768} />)
    expect(screen.getByText("estrecho")).toBeInTheDocument()
  })

  it("reports wide when the viewport query matches", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query === "(min-width: 768px)",
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    )
    render(<Probe px={768.4} />)
    expect(screen.getByText("ancho")).toBeInTheDocument()
  })
})
