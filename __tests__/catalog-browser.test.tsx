import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CatalogBrowser } from "@/app/catalog/catalog-browser"
import type { CatalogItem } from "@/lib/catalog"

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

function item(partial: Partial<CatalogItem> & Pick<CatalogItem, "name" | "kind">): CatalogItem {
  return {
    type: "registry:block",
    title: partial.name,
    titleEs: partial.titleEs ?? partial.name,
    description: "",
    descriptionEs: partial.descriptionEs ?? "",
    categories: partial.categories ?? [],
    dependencies: [],
    registryDependencies: [],
    docs: "",
    files: [],
    examples: [],
    previewHref: "",
    api: [],
    usage: "",
    ...partial,
  }
}

const items = [
  item({
    name: "layered-panel",
    kind: "block",
    titleEs: "Panel en capas",
    descriptionEs: "Panel de detalle que se abre a la derecha.",
    categories: ["dashboard"],
  }),
  item({
    name: "use-clock",
    kind: "hook",
    titleEs: "Reloj",
    descriptionEs: "Hora local del registro.",
    categories: ["time"],
  }),
]

describe("CatalogBrowser", () => {
  it("filters the grid by search text and type", async () => {
    const user = userEvent.setup()
    render(
      <CatalogBrowser
        items={items}
        categories={["dashboard", "time"]}
        renderPreview={() => <div>preview</div>}
      />,
    )

    expect(screen.getByRole("heading", { name: "Panel en capas" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Reloj" })).toBeInTheDocument()

    await user.type(screen.getByRole("textbox", { name: "Search items" }), "derecha")

    expect(screen.getByRole("heading", { name: "Panel en capas" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Reloj" })).not.toBeInTheDocument()
    expect(screen.getByText("1 item")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Hook" }))

    expect(screen.getByText("No items match this search.")).toBeInTheDocument()
    expect(screen.getByText("0 items")).toBeInTheDocument()
  })
})
