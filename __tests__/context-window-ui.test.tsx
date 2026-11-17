import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useMemo } from "react"
import { describe, expect, it, vi } from "vitest"

import {
  emptyContextModel,
  type ContextEvent,
  type ContextSource,
} from "@/registry/lib/context-window"
import { ContextWindow, contextWindowLabelsEs, useContextEventStream } from "@/registry/ui/context-window"

function source(partial: Partial<ContextSource> & Pick<ContextSource, "id" | "label">): ContextSource {
  return {
    kind: "file",
    tokens: 100,
    status: "loaded",
    cached: false,
    cacheTokens: 0,
    pinned: false,
    ...partial,
  }
}

describe("ContextWindow", () => {
  it("moves with the keyboard, opens on enter, and rolls a pin back", async () => {
    const user = userEvent.setup()
    const onPinChange = vi.fn().mockRejectedValue(new Error("no"))
    const first = render(
      <ContextWindow
        locale="es-MX"
        labels={contextWindowLabelsEs}
        modelLimit={100}
        sources={[source({ id: "ficha", label: "Ficha del horno", kind: "rag", tokens: 30 }), source({ id: "charla", label: "Charla del pedido", kind: "chat", tokens: 40 })]}
      />,
    )
    const rows = screen.getByRole("listbox", { name: "Fuentes" })
    const option = within(rows).getAllByRole("option")[0]
    expect(option).toBeDefined()
    option?.focus()
    await user.keyboard("{ArrowDown}{Enter}")
    expect(screen.getByRole("region", { name: "Detalle de la fuente" })).toHaveTextContent("Charla del pedido")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("region", { name: "Detalle de la fuente" })).not.toBeInTheDocument()
    first.unmount()

    const view = render(
      <ContextWindow
        locale="es-MX"
        labels={contextWindowLabelsEs}
        modelLimit={100}
        sources={[source({ id: "foto", label: "Foto del horno", tokens: 10 })]}
        onPinChange={onPinChange}
      />,
    )
    const photoRows = within(view.getByRole("listbox", { name: "Fuentes" }))
    await user.click(photoRows.getByRole("option", { name: /Foto del horno/ }))
    await user.click(screen.getByRole("button", { name: "Fijar fuente" }))
    expect(onPinChange).toHaveBeenCalledWith("foto", true)
    expect(photoRows.getByRole("option", { name: /Foto del horno/ })).toHaveAttribute("data-pinned", "false")
    expect(screen.getByRole("status")).toHaveTextContent("No se pudo fijar")
  })

  it("announces a new total and a crossed threshold", async () => {
    const onThreshold = vi.fn()
    const low = [source({ id: "a", label: "Nota", tokens: 10 })]
    const high = [source({ id: "a", label: "Nota", tokens: 90 })]
    const view = render(
      <ContextWindow sources={low} modelLimit={100} locale="en-US" compactAt={{ unit: "percent", value: 80 }} onThreshold={onThreshold} />,
    )
    view.rerender(
      <ContextWindow sources={high} modelLimit={100} locale="en-US" compactAt={{ unit: "percent", value: 80 }} onThreshold={onThreshold} />,
    )
    expect(onThreshold).toHaveBeenCalledWith({ kind: "compact", used: 90, limit: 100 })
    expect(await screen.findByRole("status")).toHaveTextContent("90 of 100 tokens.")
  })

  it("follows a stream of events", async () => {
    function Probe() {
      const sourceFactory = useMemo(
        () => () =>
          (async function* events(): AsyncGenerator<ContextEvent> {
            yield { type: "load", source: source({ id: "a", label: "Nota", tokens: 5 }) }
          })(),
        [],
      )
      const state = useContextEventStream(sourceFactory, emptyContextModel())
      return <p>{state.sources.length}</p>
    }
    render(<Probe />)
    expect(await screen.findByText("1")).toBeInTheDocument()
  })
})
