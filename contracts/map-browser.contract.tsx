// RUI-CONTRACT-001 · minimal family suite (API + a11y) for map browsers.
// A piece in this family takes `places`, `total` and a `provider`, keeps the
// list as the accessible source, names the map region, shows the provider
// attribution, and gives each place one named control on the map.
import type { ReactElement } from "react"
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

type Place = { id: string; title: string; subtitle?: string; position: { lng: number; lat: number }; category?: string }
type ContractProps = {
  places: Place[]
  total: number
  provider: { styles: { light: object }; attribution: string }
  categories?: Array<{ id: string; label: string }>
  onSelectedChange?: (id: string | null) => void
}

const places: Place[] = [
  { id: "a", title: "Lugar A", position: { lng: 1, lat: 1 }, category: "x" },
  { id: "b", title: "Lugar B", position: { lng: 2, lat: 2 }, category: "x" },
]
const base: ContractProps = {
  places,
  total: 2,
  provider: { styles: { light: { version: 8, sources: {}, layers: [] } }, attribution: "© Contrato" },
  categories: [{ id: "x", label: "Tipo X" }],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function describeMapBrowserContract(name: string, renderPiece: (props: any) => ReactElement) {
  describe(`${name} · map-browser family contract`, () => {
    afterEach(() => cleanup())

    it("CONTRACT-API: renders one list item per place and a count", () => {
      render(renderPiece(base))
      expect(screen.getAllByRole("listitem")).toHaveLength(2)
      expect(screen.getByText("2 resultados")).toBeTruthy()
    })

    it("CONTRACT-A11Y-REGION: the map is a named region with visible attribution", () => {
      render(renderPiece(base))
      expect(screen.getByRole("region", { name: "Mapa" })).toBeTruthy()
      expect(screen.getByText("© Contrato")).toBeTruthy()
    })

    it("CONTRACT-A11Y-PINS: every place has a named map control and a single tab stop", async () => {
      render(renderPiece(base))
      const a = await screen.findByRole("button", { name: "Lugar A, Tipo X" })
      const b = await screen.findByRole("button", { name: "Lugar B, Tipo X" })
      expect([a.tabIndex, b.tabIndex].sort()).toEqual([-1, 0])
    })

    it("CONTRACT-SELECT: selecting from the list reports the id", async () => {
      const picked: Array<string | null> = []
      render(renderPiece({ ...base, onSelectedChange: (id: string | null) => picked.push(id) }))
      fireEvent.click(within(screen.getAllByRole("list")[0]).getByRole("button", { name: /^Lugar B/ }))
      await waitFor(() => expect(picked).toEqual(["b"]))
    })

    it("CONTRACT-STATES: empty and nomatch are told apart", () => {
      const { rerender } = render(renderPiece({ ...base, places: [], total: 0 }))
      expect(screen.getByText("Aún no hay lugares.")).toBeTruthy()
      rerender(renderPiece({ ...base, places: [], total: 5 }))
      expect(screen.getByText("Ningún resultado con estos filtros.")).toBeTruthy()
    })
  })
}
