import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { VideoPlayer } from "@/registry/ui/video-player"

describe("VideoPlayer", () => {
  it("toggles playback from the keyboard", async () => {
    const user = userEvent.setup()
    const play = vi.fn().mockResolvedValue(undefined)
    const pause = vi.fn()
    HTMLMediaElement.prototype.play = play
    HTMLMediaElement.prototype.pause = pause
    render(<VideoPlayer src="about:blank" label="Clip" playLabel="Play" />)
    const region = screen.getByRole("region", { name: "Clip" })
    region.focus()
    await user.keyboard("k")
    expect(play).toHaveBeenCalled()
  })
})
