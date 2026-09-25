import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LayeredPanel, type LayeredPanelMode } from "@/registry/ui/layered-panel"

function Harness({ initialMode = "peek" }: { initialMode?: LayeredPanelMode }) {
  const [open, setOpen] = useState(true)
  const [mode, setMode] = useState<LayeredPanelMode>(initialMode)

  return (
    <LayeredPanel
      open={open}
      onOpenChange={setOpen}
      mode={mode}
      onModeChange={setMode}
      title="Emma Johnson"
    >
      <LayeredPanel.Header>
        <h2>Emma Johnson</h2>
      </LayeredPanel.Header>
      <LayeredPanel.ExpandToggle />
      <LayeredPanel.Peek>
        <p>AI insights</p>
      </LayeredPanel.Peek>
      <LayeredPanel.Full>
        <p>Payment information</p>
      </LayeredPanel.Full>
    </LayeredPanel>
  )
}

describe("LayeredPanel", () => {
  it("opens in peek and keeps the full column inert", () => {
    render(<Harness />)

    expect(screen.getByRole("dialog", { name: "Emma Johnson" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "View full profile" })).toHaveAttribute(
      "aria-expanded",
      "false",
    )
    expect(screen.getByText("AI insights")).toBeInTheDocument()
    expect(
      document.querySelector("[data-slot='layered-panel-full']"),
    ).toHaveAttribute("inert")
    expect(document.querySelector("[data-slot='layered-panel']")).toHaveAttribute(
      "data-mode",
      "peek",
    )
  })

  it("expands to full and collapses back", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole("button", { name: "View full profile" }))

    expect(screen.getByRole("button", { name: "Close profile" })).toHaveAttribute(
      "aria-expanded",
      "true",
    )
    expect(screen.getByText("Payment information")).toBeInTheDocument()
    expect(document.querySelector("[data-slot='layered-panel']")).toHaveAttribute(
      "data-mode",
      "full",
    )
    expect(
      document.querySelector("[data-slot='layered-panel-full']"),
    ).not.toHaveAttribute("inert")

    await user.click(screen.getByRole("button", { name: "Close profile" }))

    expect(screen.getByRole("button", { name: "View full profile" })).toBeInTheDocument()
    expect(document.querySelector("[data-slot='layered-panel']")).toHaveAttribute(
      "data-mode",
      "peek",
    )
  })

  it("collapses on Escape from full, then closes on the next Escape", async () => {
    const user = userEvent.setup()
    render(<Harness initialMode="full" />)

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await user.keyboard("{Escape}")

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(document.querySelector("[data-slot='layered-panel']")).toHaveAttribute(
      "data-mode",
      "peek",
    )

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const overlay = document.querySelector("[data-slot='layered-panel-overlay']")
    expect(overlay).toBeTruthy()
    await user.click(overlay as HTMLElement)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
