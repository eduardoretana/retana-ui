import { readFileSync } from "node:fs"
import path from "node:path"
import { Profiler } from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { MotionConfig } from "motion/react"

import { SlideToConfirm } from "@/registry/ui/slide-to-confirm"

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

function translateX(node: HTMLElement) {
  const match = /translate(?:3d|X)\(\s*(-?[\d.]+)px/.exec(node.style.transform)
  return match ? Number(match[1]) : 0
}

async function flushFrame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  })
}

function withWidth(run: () => Promise<void> | void) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth")
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 320 })
  const done = Promise.resolve(run()).finally(() => {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, "clientWidth", descriptor)
    else delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth
  })
  return done
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

describe("slide-to-confirm gesture", () => {
  it("sigue el dedo 1:1 sin spring y sin un render por move", async () => {
    await withWidth(async () => {
      let commits = 0
      animateCalls.length = 0
      render(
        <Profiler id="slide" onRender={() => { commits += 1 }}>
          <SlideToConfirm smoothness={0.4} label="Send" />
        </Profiler>,
      )
      const slider = screen.getByRole("slider", { name: "Send" })
      fireEvent.pointerDown(slider, { button: 0, pointerId: 1, pointerType: "mouse", clientX: 0, clientY: 8, timeStamp: 0 })
      const baseline = commits
      const during = animateCalls.length
      fireEvent.pointerMove(slider, { pointerId: 1, pointerType: "mouse", clientX: 40, clientY: 8, timeStamp: 16 })
      fireEvent.pointerMove(slider, { pointerId: 1, pointerType: "mouse", clientX: 100, clientY: 8, timeStamp: 32 })
      expect(commits).toBe(baseline)
      expect(animateCalls.length).toBe(during)
      await flushFrame()
      expect(translateX(slider)).toBe(100)
    })
  })

  it("pasa la velocidad al spring del release", async () => {
    await withWidth(async () => {
      animateCalls.length = 0
      render(<SlideToConfirm smoothness={0.4} label="Send" threshold={0.9} />)
      const slider = screen.getByRole("slider", { name: "Send" })
      fireEvent.pointerDown(slider, { button: 0, pointerId: 2, pointerType: "mouse", clientX: 0, clientY: 8, timeStamp: 0 })
      fireEvent.pointerMove(slider, { pointerId: 2, pointerType: "mouse", clientX: 80, clientY: 8, timeStamp: 40 })
      fireEvent.pointerUp(slider, { pointerId: 2, pointerType: "mouse", clientX: 80, clientY: 8, timeStamp: 40 })
      const release = animateCalls.find((call) => {
        const options = call[2] as { type?: string; velocity?: number } | undefined
        return options?.type === "spring" && typeof options.velocity === "number" && options.velocity !== 0
      })
      expect(release).toBeTruthy()
    })
  })

  it("con reduced motion el dedo sigue y el release no usa spring", async () => {
    const restore = reduceMotion()
    try {
      await withWidth(async () => {
        animateCalls.length = 0
        render(
          <MotionConfig reducedMotion="always">
            <SlideToConfirm label="Send" />
          </MotionConfig>,
        )
        const slider = screen.getByRole("slider", { name: "Send" })
        fireEvent.pointerDown(slider, { button: 0, pointerId: 3, pointerType: "mouse", clientX: 0, clientY: 8, timeStamp: 0 })
        fireEvent.pointerMove(slider, { pointerId: 3, pointerType: "mouse", clientX: 30, clientY: 8, timeStamp: 20 })
        await flushFrame()
        expect(translateX(slider)).toBe(30)
        const beforeRelease = animateCalls.length
        fireEvent.pointerUp(slider, { pointerId: 3, pointerType: "mouse", clientX: 30, clientY: 8, timeStamp: 40 })
        expect(animateCalls.length).toBe(beforeRelease)
        await flushFrame()
        expect(translateX(slider)).toBe(0)
      })
    } finally {
      restore()
    }
  })

  it("las escenas PLP exportan dragging, dismissed y reduced", () => {
    const source = readFileSync(path.join(process.cwd(), "app/examples/slide-to-confirm/scenes.tsx"), "utf8")
    expect(source).toMatch(/"dragging"/)
    expect(source).toMatch(/"dismissed"/)
    expect(source).toMatch(/"reduced"/)
  })
})
