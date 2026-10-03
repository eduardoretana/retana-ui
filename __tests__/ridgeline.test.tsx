import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Ridgeline } from "@/registry/ui/ridgeline"

const series = [
  { id: "mar", label: "March", values: [12, 14, 18, 19, 21] },
  { id: "apr", label: "April", values: [20, 22, 24, 25, 28] },
]

describe("Ridgeline", () => {
  it("lifts a ridge from the pointer and the keyboard", async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()
    render(<Ridgeline series={series} label="Kiln highs" unit="°C" onActiveChange={onActiveChange} />)
    const plot = screen.getByRole("group")
    fireEvent.pointerMove(plot, { pointerType: "mouse", clientX: 120, clientY: 80 })
    expect(plot.querySelectorAll("[data-slot=ridgeline-ridge][data-lifted=true]")).toHaveLength(1)
    expect(onActiveChange).toHaveBeenCalled()
    fireEvent.pointerLeave(plot, { pointerType: "mouse" })
    expect(plot.querySelector("[data-lifted=true]")).toBeNull()

    plot.focus()
    await user.keyboard("{ArrowDown}")
    expect(document.querySelector("[aria-live=polite]")).toHaveTextContent("March")
    await user.keyboard("{ArrowDown}")
    expect(document.querySelector("[aria-live=polite]")).toHaveTextContent("April")
    await user.keyboard("{ArrowRight}")
    expect(document.querySelector("[aria-live=polite]")).toHaveTextContent(/at or below/)
    await user.keyboard("{Escape}")
    expect(document.querySelector("[aria-live=polite]")).toHaveTextContent("")
    expect(screen.getByRole("table", { name: "Kiln highs" })).toBeInTheDocument()
  })

  it("names an empty chart", () => {
    render(<Ridgeline series={[]} label="Empty kiln" emptyLabel="No data yet" />)
    expect(screen.getByText("No data yet")).toBeInTheDocument()
    expect(screen.getByRole("group")).toHaveAttribute("tabindex", "-1")
  })
})
