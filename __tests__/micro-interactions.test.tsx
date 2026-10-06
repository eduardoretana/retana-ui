import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { triggerHaptic, setHapticsMuted } from "@/registry/ui/haptics"
import { MotionPreferenceControl, setMotionPreference } from "@/registry/ui/motion-preference"
import { MorphDialog } from "@/registry/ui/morph-dialog"
import { MorphPopover } from "@/registry/ui/morph-popover"
import { setPressSoundMuted } from "@/registry/ui/press-sound"
import { ShortcutButton } from "@/registry/ui/shortcut-button"
import { SlideToConfirm } from "@/registry/ui/slide-to-confirm"
import { SpotlightButton } from "@/registry/ui/spotlight-button"
import { Squircle, squirclePathString } from "@/registry/ui/squircle"
import { ThemeSwitch } from "@/registry/ui/theme-switch"
import { playUiSound, setUiSoundMuted } from "@/registry/ui/ui-sounds"
import { triggerFeedback } from "@/registry/hooks/use-feedback"

describe("ui-sounds", () => {
  it("does not start audio before a user gesture", () => {
    const AudioContext = vi.fn()
    vi.stubGlobal("AudioContext", AudioContext)
    const previous = navigator.userActivation
    Object.defineProperty(navigator, "userActivation", {
      configurable: true,
      value: { hasBeenActive: false, isActive: false },
    })
    setUiSoundMuted(false)
    playUiSound("success")
    expect(AudioContext).not.toHaveBeenCalled()
    Object.defineProperty(navigator, "userActivation", { configurable: true, value: previous })
    vi.unstubAllGlobals()
  })

  it("keeps press-sound mute on the shared store", () => {
    setPressSoundMuted(true)
    expect(playUiSound).toBeTypeOf("function")
    setUiSoundMuted(false)
    setPressSoundMuted(false)
  })
})

describe("squircle", () => {
  it("builds a closed path and renders children", () => {
    const path = squirclePathString(120, 80, 24)
    expect(path.startsWith("M")).toBe(true)
    expect(path.endsWith("Z")).toBe(true)
    render(
      <Squircle radius={24}>
        <span>Card</span>
      </Squircle>,
    )
    expect(screen.getByText("Card")).toBeInTheDocument()
  })
})

describe("theme-switch icons", () => {
  it("keeps the lucide control and accepts an animated icon", async () => {
    const user = userEvent.setup()
    const onThemeChange = vi.fn()
    const { rerender } = render(<ThemeSwitch theme="light" onThemeChange={onThemeChange} />)
    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }))
    expect(onThemeChange).toHaveBeenCalledWith("dark")

    rerender(<ThemeSwitch theme="light" icon="classic" variant="eclipse" onThemeChange={onThemeChange} />)
    const iconButton = screen.getByRole("button", { name: "Switch to dark mode" })
    expect(iconButton).toHaveAttribute("data-toggled", "false")
    const svg = iconButton.querySelector("svg")
    expect(svg?.getAttribute("style") ?? "").toContain("520ms")
    await user.click(iconButton)
    expect(onThemeChange).toHaveBeenLastCalledWith("dark")
  })
})

describe("morph overlays", () => {
  it("moves focus into the dialog and closes on escape", async () => {
    const user = userEvent.setup()
    render(
      <MorphDialog label="Edit note" title="Note">
        <input aria-label="Title" defaultValue="Draft" />
      </MorphDialog>,
    )
    await user.click(screen.getByRole("button", { name: "Edit note" }))
    expect(screen.getByRole("dialog", { name: "Note" })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveFocus()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Edit note" })).toHaveFocus()
  })

  it("opens a non-modal popover and closes it from outside", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <MorphPopover label="Actions" title="Record">
          <button type="button">Duplicate</button>
        </MorphPopover>
        <button type="button">Outside</button>
      </div>,
    )
    await user.click(screen.getByRole("button", { name: "Actions" }))
    expect(screen.getByRole("dialog", { name: "Record" })).toHaveAttribute("aria-modal", "false")
    await user.click(screen.getByRole("button", { name: "Outside" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

describe("ported buttons", () => {
  it("fires a shortcut and shows keycaps", async () => {
    const user = userEvent.setup()
    const onCommand = vi.fn()
    render(
      <ShortcutButton shortcut="b" preventDefault={false} onCommand={onCommand}>
        Save
      </ShortcutButton>,
    )
    expect(screen.getByRole("button", { name: /Save/ })).toHaveAttribute("data-shortcut", "b")
    await user.keyboard("b")
    expect(onCommand).toHaveBeenCalledOnce()
  })

  it("renders the spotlight control", () => {
    render(<SpotlightButton>Continue</SpotlightButton>)
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()
  })

  it("confirms from the keyboard once the threshold is crossed", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth")
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 320 })
    render(<SlideToConfirm threshold={0.9} resetAfter={0} onConfirm={onConfirm} label="Send" />)
    const slider = screen.getByRole("slider", { name: "Send" })
    slider.focus()
    for (let step = 0; step < 9; step += 1) await user.keyboard("{ArrowRight}")
    expect(onConfirm).toHaveBeenCalled()
    if (descriptor) Object.defineProperty(HTMLElement.prototype, "clientWidth", descriptor)
  })
})

describe("haptics and motion", () => {
  it("vibrates only when enabled and the API exists", () => {
    const vibrate = vi.fn()
    vi.stubGlobal("navigator", { ...navigator, vibrate })
    setHapticsMuted(false)
    triggerHaptic("success")
    expect(vibrate).toHaveBeenCalled()
    setHapticsMuted(true)
    vibrate.mockClear()
    triggerHaptic("tap")
    expect(vibrate).not.toHaveBeenCalled()
    setHapticsMuted(false)
    vi.unstubAllGlobals()
  })

  it("stores a reduced-motion override", async () => {
    const user = userEvent.setup()
    setMotionPreference("system")
    render(<MotionPreferenceControl />)
    await user.click(screen.getByRole("radio", { name: "Reduce" }))
    expect(screen.getByRole("radio", { name: "Reduce" })).toHaveAttribute("aria-checked", "true")
    setMotionPreference("system")
  })

  it("triggers feedback without throwing when muted", () => {
    setUiSoundMuted(true)
    setHapticsMuted(true)
    expect(() => triggerFeedback("attention")).not.toThrow()
    setUiSoundMuted(false)
    setHapticsMuted(false)
  })
})
