import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LightboxGallery } from "@/registry/ui/lightbox"

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
})
