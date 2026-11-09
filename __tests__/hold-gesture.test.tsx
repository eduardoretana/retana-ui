import { readFileSync } from "node:fs"
import path from "node:path"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { HoldToConfirm } from "@/registry/ui/hold-to-confirm"
import { motionPresets } from "@/registry/lib/motion"

const animateCalls = vi.hoisted(() => [] as unknown[][])

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react")
  return {
    ...actual,
    animate: (...args: unknown[]) => {
      animateCalls.push(args)
      return actual.animate(...(args as Parameters<typeof actual.animate>))
    },
  }
})

describe("hold-to-confirm gesture", () => {
  it("al soltar vuelve en 0.16 s con ease-out y sin spring", () => {
    animateCalls.length = 0
    render(<HoldToConfirm label="Hold to delete" duration={5000} onConfirm={vi.fn()} />)
    const button = screen.getByRole("button", { name: "Hold to delete" })
    fireEvent.pointerDown(button, { button: 0, pointerId: 1, isPrimary: true, clientX: 20, clientY: 20 })
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 20, clientY: 20 })
    const rewind = animateCalls.find((call) => call[1] === 0)
    const options = rewind?.[2] as { duration?: number; ease?: readonly number[]; type?: string } | undefined
    expect(options?.type).not.toBe("spring")
    expect(options?.duration).toBe(motionPresets.duration.fast)
    expect(options?.ease).toEqual([...motionPresets.ease.exit])
  })

  it("el hold cubre 44 px y el hover va detrás del media query", () => {
    render(<HoldToConfirm label="Hold to delete" onConfirm={vi.fn()} />)
    const button = screen.getByRole("button", { name: "Hold to delete" })
    expect(button.className).toMatch(/before:h-11/)
    expect(button.className).toMatch(/before:w-11/)
    expect(button.className).toMatch(/\(hover: hover\) and \(pointer: fine\)|hover:hover.*pointer:fine/)
    expect(button.className).not.toMatch(/(?:^|\s)enabled:hover:bg-/)
  })

  it("las escenas PLP exportan dragging, dismissed y reduced", () => {
    const source = readFileSync(path.join(process.cwd(), "app/examples/hold-to-confirm/scenes.tsx"), "utf8")
    expect(source).toMatch(/"dragging"/)
    expect(source).toMatch(/"dismissed"/)
    expect(source).toMatch(/"reduced"/)
  })
})
