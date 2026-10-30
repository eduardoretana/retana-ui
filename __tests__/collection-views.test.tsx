import { readFileSync } from "node:fs"
import type { ComponentProps } from "react"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CollectionViews, collectionViewsLabelsEn } from "@/registry/ui/collection-views"

const groups = [
  { id: "banco", label: "En el banco" },
  { id: "horno", label: "En el horno" },
]

const items = [
  {
    id: "jarron",
    groupId: "banco",
    title: "Jarrón cobalto",
    detail: "Casa León",
    people: [{ id: "nuria", name: "Nuria Solís" }],
    start: "2026-10-27",
    end: "2026-11-02",
  },
  {
    id: "platon",
    groupId: "horno",
    title: "Platón de esmalte",
    start: "2026-10-18",
    end: "2026-10-24",
  },
]

function renderFilled(props: Partial<ComponentProps<typeof CollectionViews>> = {}) {
  return render(<CollectionViews items={items} groups={groups} today="2026-10-30" onItemOpen={() => undefined} {...props} />)
}

describe("CollectionViews", () => {
  it("switches board, list, and timeline from the pill", async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    renderFilled({ onViewChange })
    expect(screen.getByRole("button", { name: "Tablero" })).toHaveAttribute("aria-pressed", "true")
    expect(document.querySelector("[data-slot='collection-views']")).toHaveAttribute("data-view", "board")
    expect(document.querySelector("[data-slot='collection-views']")).toHaveAttribute("data-motion", "morph")
    expect(document.querySelector("[data-shared$=':title:jarron']")).not.toBeNull()
    await user.click(screen.getByRole("button", { name: "Lista" }))
    expect(onViewChange).toHaveBeenCalledWith("list")
    expect(document.querySelector("[data-slot='collection-views']")).toHaveAttribute("data-view", "list")
    expect(screen.getByText("Título")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Cronograma" }))
    expect(document.querySelectorAll("[data-slot='collection-bar']")).toHaveLength(2)
    expect(document.querySelector("[data-slot='collection-bar'][data-current='true']")).not.toBeNull()
    expect(document.querySelectorAll("[data-slot='collection-bar'][data-current='true']")).toHaveLength(1)
    expect(document.querySelector("[data-slot='collection-today']")).not.toBeNull()
    expect(document.querySelector("[data-slot='collection-clip']")).not.toBeNull()
  })

  it("moves the pill with the arrow keys", async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    renderFilled({ onViewChange })
    screen.getByRole("button", { name: "Tablero" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onViewChange).toHaveBeenCalledWith("list")
  })

  it("filters from a 16px search field and clears it", async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    renderFilled({ onQueryChange })
    const search = screen.getByRole("searchbox", { name: "Buscar" })
    expect(search.className).toContain("text-base")
    await user.type(search, "platón")
    expect(onQueryChange).toHaveBeenCalled()
    expect(screen.queryByText("Jarrón cobalto")).not.toBeInTheDocument()
    expect(screen.getByText("Platón de esmalte")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Borrar búsqueda" }))
    expect(screen.getByText("Jarrón cobalto")).toBeInTheDocument()
  })

  it("renders empty, loading, and error", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<CollectionViews />)
    expect(screen.getByText("Esta colección no tiene elementos.")).toBeInTheDocument()
    rerender(<CollectionViews loading items={items} groups={groups} />)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando la colección")
    expect(screen.queryByText("Jarrón cobalto")).not.toBeInTheDocument()
    rerender(<CollectionViews error="No se cargó la colección." onRetry={onRetry} items={items} groups={groups} />)
    expect(screen.getByRole("alert")).toHaveTextContent("No se cargó la colección.")
    await user.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("speaks English when the host passes that label set", () => {
    renderFilled({ labels: collectionViewsLabelsEn, query: "zzzz" })
    expect(screen.getByRole("button", { name: "Board" })).toBeInTheDocument()
    expect(screen.getByText("No item matches the search.")).toBeInTheDocument()
  })

  it("keeps the morph on transform and opacity", () => {
    const source = [
      readFileSync("registry/ui/collection-views.tsx", "utf8"),
      readFileSync("registry/lib/collection-morph.ts", "utf8"),
    ].join("\n")
    expect(source).not.toMatch(/transition-all/)
    expect(source).not.toMatch(/transition\s*:\s*all/)
    expect(source).not.toMatch(/\bblur\s*\(/)
    expect(source).not.toMatch(/will-change/)
    expect(source).not.toMatch(/box-shadow|boxShadow/)
    expect(source).not.toMatch(/transition-\[/)
    expect(source).not.toMatch(/animate=\{\{[^}]*(width|height|top|left|margin|padding)/)
    expect(source).toContain("collectionSharedMotion")
    expect(source).toContain("collectionBarMotion")
    expect(source).toContain("COLLECTION_TIMELINE_SIDEBAR")
  })
})
