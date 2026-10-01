import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Sparkline } from "@/registry/ui/sparkline"

const data = [12, 18, 15, 22, 19]

describe("Sparkline", () => {
  it("names the series and scrubs with the keyboard", async () => {
    const user = userEvent.setup()
    render(<Sparkline data={data} label="Kiln" value="19" change="+7" labels={["Mon", "Tue", "Wed", "Thu", "Fri"]} />)
    const slider = screen.getByRole("slider", { name: "Kiln, explore values" })
    expect(slider).toHaveAttribute("aria-valuenow", "5")
    expect(slider).toHaveAttribute("aria-valuetext", "Fri: 19")
    slider.focus()
    await user.keyboard("{ArrowLeft}")
    expect(slider).toHaveAttribute("aria-valuenow", "4")
    expect(slider).toHaveAttribute("aria-valuetext", "Thu: 22")
    await user.keyboard("{Home}")
    expect(slider).toHaveAttribute("aria-valuenow", "1")
    expect(slider).toHaveAttribute("aria-valuetext", "Mon: 12")
    await user.keyboard("{Escape}")
    expect(slider).toHaveAttribute("aria-valuetext", "Fri: 19")
  })

  it("draws a line for a single point", () => {
    render(<Sparkline data={[4]} label="Empty kiln" interactive={false} />)
    expect(screen.getByRole("figure", { name: /Empty kiln/ })).toBeInTheDocument()
    expect(screen.queryByRole("slider")).not.toBeInTheDocument()
  })
})
