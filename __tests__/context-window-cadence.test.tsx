import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { ContextSource } from "@/registry/lib/context-window"
import { ContextWindow, contextWindowLabelsEs } from "@/registry/ui/context-window"

// emil-design-eng, "Should this animate at all?": the used-token figure and the
// caption change on every stream event (the playback scene fires one every
// 280 ms). A wait-mode crossfade (exit, then enter) outlasts that cadence, so
// the new value must replace the old one at once, with no exiting copy left.
function source(tokens: number): ContextSource {
  return { id: "ficha", label: "Ficha del horno", kind: "rag", tokens, status: "loaded", cached: false, cacheTokens: 0, pinned: false }
}

describe("ContextWindow update cadence", () => {
  it("swaps the used-token figure without a crossfade", () => {
    const view = render(<ContextWindow locale="es-MX" labels={contextWindowLabelsEs} modelLimit={100} sources={[source(30)]} />)
    view.rerender(<ContextWindow locale="es-MX" labels={contextWindowLabelsEs} modelLimit={100} sources={[source(40)]} />)
    const figure = view.container.querySelector("[data-slot='card-action'] p")
    expect(figure).not.toBeNull()
    expect(figure?.textContent).toContain("40")
    expect(figure?.textContent).not.toContain("30")
  })

  it("swaps the caption without a crossfade", () => {
    const view = render(<ContextWindow locale="es-MX" labels={contextWindowLabelsEs} modelLimit={100} sources={[source(30)]} caption="Se cargó la ficha" />)
    view.rerender(<ContextWindow locale="es-MX" labels={contextWindowLabelsEs} modelLimit={100} sources={[source(30)]} caption="Se fijó la ficha" />)
    expect(screen.getByText("Se fijó la ficha")).toBeTruthy()
    expect(screen.queryByText("Se cargó la ficha")).toBeNull()
  })
})
