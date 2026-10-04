import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { TwoFactorCard } from "@/registry/ui/two-factor-card"

function slots(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>("[data-slot='two-factor-slot']")]
}

function codeInput(container: HTMLElement) {
  const input = container.querySelector("input")
  if (!input) throw new Error("Missing code input")
  return input
}

function digits(container: HTMLElement) {
  return slots(container)
    .map((slot) => slot.textContent ?? "")
    .join("")
}

function reduceMotion() {
  const original = window.matchMedia
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
  return () => {
    window.matchMedia = original
  }
}

afterEach(() => {
  vi.useRealTimers()
})

beforeAll(() => {
  if (typeof document.elementFromPoint !== "function") {
    document.elementFromPoint = () => null
  }
})

describe("TwoFactorCard", () => {
  it("advances as digits are typed, skips other characters, and moves back with Backspace and arrows", async () => {
    const user = userEvent.setup()
    const { container } = render(<TwoFactorCard />)
    const input = codeInput(container)
    await user.click(input)
    await user.type(input, "1")
    expect(slots(container)[0]).toHaveAttribute("data-filled", "true")
    expect(slots(container)[1]).toHaveAttribute("data-active", "true")
    await user.type(input, "a2")
    expect(digits(container)).toBe("12")
    await user.keyboard("{Backspace}")
    expect(digits(container)).toBe("1")
    await user.keyboard("{ArrowLeft}9")
    expect(digits(container).startsWith("9")).toBe(true)
    expect(input).toHaveAttribute("inputmode", "numeric")
    expect(input).toHaveAttribute("autocomplete", "one-time-code")
  })

  it("fills every slot from a pasted code", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = render(<TwoFactorCard onValueChange={onValueChange} />)
    const input = codeInput(container)
    await user.click(input)
    await user.paste("135790")
    expect(digits(container)).toBe("135790")
    expect(onValueChange).toHaveBeenCalledWith("135790")
  })

  it("marks an incomplete code and a rejected code, then clears the error when typing", async () => {
    const user = userEvent.setup()
    const onVerify = vi.fn(async () => false)
    const { container } = render(<TwoFactorCard onVerify={onVerify} />)
    await user.click(screen.getByRole("button", { name: "Verify & continue" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Enter the full code")
    expect(container.querySelector("[data-slot='two-factor-card']")).toHaveAttribute("data-state", "error")
    expect(container.querySelector("[data-slot='two-factor-icon']")).toHaveAttribute("data-error", "true")
    expect(slots(container).every((slot) => slot.getAttribute("data-invalid") === "true")).toBe(true)

    const input = codeInput(container)
    await user.click(input)
    await user.type(input, "1")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()

    await user.type(input, "00000")
    await user.click(screen.getByRole("button", { name: "Verify & continue" }))
    expect(onVerify).toHaveBeenCalledWith("100000")
    expect(await screen.findByRole("alert")).toHaveTextContent("That code is not valid")
  })

  it("shows a spinner while verify is pending and then the success handoff", async () => {
    const user = userEvent.setup()
    let resolve: (value: boolean) => void = () => {}
    const onVerify = vi.fn(
      () =>
        new Promise<boolean>((done) => {
          resolve = done
        }),
    )
    const onContinue = vi.fn()
    const { container } = render(<TwoFactorCard onVerify={onVerify} onContinue={onContinue} />)
    const input = codeInput(container)
    await user.click(input)
    await user.paste("246810")
    const verify = screen.getByRole("button", { name: "Verify & continue" })
    await user.click(verify)
    expect(verify).toBeDisabled()
    expect(container.querySelector("[data-slot='two-factor-spinner']")).toBeTruthy()
    await act(async () => {
      resolve(true)
    })
    const next = await screen.findByRole("button", { name: "Continue to dashboard" })
    expect(screen.getByRole("heading", { name: "Verification successful" })).toBeInTheDocument()
    const panes = container.querySelectorAll("[data-slot='two-factor-pane']")
    expect(panes[0]).toHaveAttribute("aria-hidden", "true")
    expect(panes[1]).not.toHaveAttribute("aria-hidden")
    await user.click(next)
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it("counts down, announces once per minute and at zero, then offers resend", async () => {
    vi.useFakeTimers()
    const onExpire = vi.fn()
    const onResend = vi.fn()
    const { container } = render(<TwoFactorCard expiresIn={120} onExpire={onExpire} onResend={onResend} />)
    const clock = () => container.querySelector("[data-slot='two-factor-clock']")
    const live = () => container.querySelector("[data-slot='two-factor-expiry-live']")
    expect(clock()).toHaveTextContent("02:00")
    expect(live()).toHaveTextContent("Code expires in 2 minutes")

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(clock()).toHaveTextContent("01:59")
    expect(live()).toHaveTextContent("Code expires in 2 minutes")
    expect(onExpire).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(59_000)
    })
    expect(live()).toHaveTextContent("Code expires in 1 minute")

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000)
    })
    expect(onExpire).toHaveBeenCalledOnce()
    expect(live()).toHaveTextContent("Code expired")
    await act(async () => {
      screen.getByRole("button", { name: "Resend code" }).click()
    })
    expect(onResend).toHaveBeenCalledOnce()
    expect(clock()).toHaveTextContent("02:00")
  })

  it("skips the shake when the reader prefers reduced motion", async () => {
    const restore = reduceMotion()
    try {
      const { container } = render(<TwoFactorCard defaultValue="000000" autoSubmit onVerify={() => false} />)
      expect(await screen.findByRole("alert")).toHaveTextContent("That code is not valid")
      const root = container.querySelector("[data-slot='two-factor-card']")
      expect(root).toHaveAttribute("data-motion", "reduce")
      expect(container.querySelector("style")?.textContent).toContain("prefers-reduced-motion: reduce")
      expect(container.querySelector("style")?.textContent).toContain("animation: none")
    } finally {
      restore()
    }
  })
})
