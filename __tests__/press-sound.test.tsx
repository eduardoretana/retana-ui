import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { PressSoundToggle, setPressSoundMuted } from "@/registry/ui/press-sound"

describe("PressSound", () => {
  it("toggles the shared mute flag", async () => {
    const user = userEvent.setup()
    setPressSoundMuted(false)
    render(<PressSoundToggle mutedLabel="Unmute clicks" unmutedLabel="Mute clicks" />)
    await user.click(screen.getByRole("button", { name: "Mute clicks" }))
    expect(screen.getByRole("button", { name: "Unmute clicks" })).toHaveAttribute("aria-pressed", "true")
  })
})
