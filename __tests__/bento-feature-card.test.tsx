import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { BentoCell, BentoGrid } from "@/registry/ui/bento-grid"
import { BentoFeatureCard } from "@/registry/ui/bento-feature-card"

describe("BentoFeatureCard", () => {
  it("renders media, icon, title, description, and one link", () => {
    render(
      <BentoFeatureCard
        title="Horno norte"
        description="Calendario de quemas."
        cta="Ver agenda"
        href="#horno"
        icon={<span data-testid="icon">icono</span>}
        illustration={<span data-testid="art">dibujo</span>}
      />,
    )

    const link = screen.getByRole("link", { name: /Horno norte/ })
    expect(link).toHaveAttribute("href", "#horno")
    expect(link).toHaveTextContent("Calendario de quemas.")
    expect(link).toHaveTextContent("Ver agenda")
    expect(screen.getByTestId("art")).toBeInTheDocument()
    expect(screen.getByTestId("icon")).toBeInTheDocument()
    expect(document.querySelector("[data-slot='bento-feature-cta']")).not.toBeNull()
    expect(document.querySelector("[data-slot='bento-feature-cta']")?.className).toContain("text-primary")
    expect(screen.queryAllByRole("link")).toHaveLength(1)
    expect(screen.queryByRole("button")).toBeNull()
    expect(link.querySelector("a, button")).toBeNull()
  })

  it("omits the cta and the media when those slots are absent", () => {
    const { rerender } = render(<BentoFeatureCard title="Horno" description="Texto" />)
    expect(document.querySelector("[data-slot='bento-feature-cta']")).toBeNull()
    expect(screen.queryByRole("link")).toBeNull()

    rerender(<BentoFeatureCard title="Horno" description="Texto" href="#h" cta="Ver" />)
    expect(document.querySelector("[data-slot='bento-feature-media']")).toBeNull()
    expect(screen.getByRole("link", { name: /Horno/ })).toHaveTextContent("Ver")
  })

  it("hover animates transform and opacity only", () => {
    const { container } = render(
      <BentoFeatureCard title="Horno" description="Texto" href="#h" illustration={<span>dibujo</span>} />,
    )
    const html = container.innerHTML
    expect(html).not.toContain("transition-all")
    expect(html).not.toContain("transition-colors")
    expect(html).toContain("motion-reduce:transition-none")
    expect(html).toContain("hover:will-change-transform")
    expect(html).toContain("group-hover/feature:will-change-transform")
    expect(html).toContain("rounded-xl")
    expect(html).not.toMatch(/rounded-\[\d+px\]/)
    expect(html).not.toMatch(/p-\[\d+px\]/)
    const card = document.querySelector("[data-slot='bento-feature-card']")
    expect(card?.className).toMatch(/transition-transform/)
    expect(card?.className).not.toMatch(/(^|\s)will-change-transform(\s|$)/)
    expect(card?.className).not.toContain("rounded-xl")
    expect(card?.className).not.toContain("border")
    const copy = document.querySelector("[data-slot='bento-feature-title']")?.parentElement
    expect(copy?.className).toContain("max-w-[17.5rem]")
    expect(document.querySelector("[data-slot='bento-feature-title']")?.className ?? "").not.toContain("text-primary")
    expect(document.querySelector("[data-slot='bento-feature-description']")?.className ?? "").not.toContain("text-primary")
  })

  it("is one tab stop with a visible focus ring", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <>
        <button type="button">Antes</button>
        <BentoFeatureCard title="Horno norte" description="Texto" href="#h" cta="Ver" />
      </>,
    )
    expect(container.innerHTML).toContain("focus-within:ring-2")
    await user.tab()
    expect(screen.getByRole("button", { name: "Antes" })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole("link", { name: /Horno norte/ })).toHaveFocus()
  })

  it("keeps a long token in the accessible name", () => {
    const token = "Y".repeat(60)
    render(<BentoFeatureCard title={token} description="Sigue el texto." href="#h" />)
    expect(screen.getByRole("link", { name: new RegExp(token) })).toBeInTheDocument()
  })

  it("shows empty, loading, and error without a link", () => {
    const { rerender } = render(<BentoFeatureCard status="empty" emptyLabel="Sin ficha" href="#h" />)
    expect(screen.getByText("Sin ficha")).toBeInTheDocument()
    expect(screen.queryByRole("link")).toBeNull()

    rerender(<BentoFeatureCard status="loading" loadingLabel="Cargando horno" title="Horno" href="#h" />)
    expect(screen.getByText("Cargando horno")).toBeInTheDocument()
    expect(document.querySelector("[data-slot='bento-feature-card']")).toHaveAttribute("aria-busy", "true")
    expect(screen.queryByRole("link")).toBeNull()

    rerender(<BentoFeatureCard status="error" errorLabel="No se pudo abrir" title="Horno" href="#h" />)
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("No se pudo abrir")
    expect(alert.className).toContain("font-medium")
    expect(alert.className).toContain("text-destructive")
    expect(screen.queryByRole("link")).toBeNull()
  })

  it("composes inside a bento cell", () => {
    render(
      <BentoGrid label="Muro">
        <BentoCell span={{ col: 2, row: 1 }}>
          <BentoFeatureCard title="Horno" description="Texto" />
        </BentoCell>
      </BentoGrid>,
    )
    const cell = document.querySelector("[data-slot='bento-cell']")
    expect(cell?.querySelector("[data-slot='bento-feature-card']")).not.toBeNull()
  })

  it("defaults to media-first and can lead with the copy", () => {
    const { rerender } = render(
      <BentoFeatureCard title="Horno" description="Texto" illustration={<span>dibujo</span>} />,
    )
    const card = document.querySelector("[data-slot='bento-feature-card']")
    expect(card).toHaveAttribute("data-layout", "media-first")
    const mediaFirst = card?.textContent ?? ""
    expect(mediaFirst.indexOf("dibujo")).toBeLessThan(mediaFirst.indexOf("Horno"))

    rerender(
      <BentoFeatureCard layout="copy-first" title="Horno" description="Texto" illustration={<span>dibujo</span>} />,
    )
    const flipped = document.querySelector("[data-slot='bento-feature-card']")
    expect(flipped).toHaveAttribute("data-layout", "copy-first")
    const copyFirst = flipped?.textContent ?? ""
    expect(copyFirst.indexOf("Horno")).toBeLessThan(copyFirst.indexOf("dibujo"))
  })
})
