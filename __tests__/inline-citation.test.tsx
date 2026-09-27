import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { InlineCitation } from "@/registry/ui/inline-citation"

describe("InlineCitation", () => {
  it("reveals the source on focus", async () => {
    const user = userEvent.setup()
    render(
      <InlineCitation
        index={3}
        source={{ title: "Annex", domain: "bruma.example", excerpt: "Forty-five days." }}
      />,
    )
    await user.tab()
    expect(screen.getByRole("tooltip")).toHaveTextContent("Forty-five days.")
  })
})
