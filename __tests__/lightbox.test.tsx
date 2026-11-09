import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LightboxGallery } from "@/registry/ui/lightbox"
import labels from "../fixtures/lightbox.json"

describe("Lightbox", () => {
  it("opens the chosen image and closes with Escape", async () => {
    const user = userEvent.setup()
    render(
      <LightboxGallery
        items={[
          { src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E", alt: "Patio" },
          { src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E", alt: "Mesa" },
        ]}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Mesa" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getAllByRole("img", { name: "Mesa" }).length).toBeGreaterThan(0)
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("pone el nombre accesible del closeLabel en el botón de cerrar", async () => {
    const user = userEvent.setup()
    render(
      <LightboxGallery
        closeLabel="Cerrar"
        items={[{ src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E", alt: "Patio" }]}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Patio" }))
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument()
  })

  it("pone los cinco nombres accesibles de es-MX cuando se pasan a LightboxGallery", async () => {
    const user = userEvent.setup()
    const es = labels.labels.es
    render(
      <LightboxGallery
        closeLabel={es.close}
        previousLabel={es.previous}
        nextLabel={es.next}
        zoomInLabel={es.zoomIn}
        zoomOutLabel={es.zoomOut}
        items={[
          { src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E", alt: "Patio" },
          { src: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E", alt: "Mesa" },
        ]}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Patio" }))
    const missing = [es.close, es.previous, es.next, es.zoomIn, es.zoomOut].filter((name) => screen.queryByRole("button", { name }) == null)
    expect(missing).toEqual([])
  })
})
