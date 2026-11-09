import { readFileSync } from "node:fs"
import path from "node:path"
import { Profiler } from "react"
import { fireEvent, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NotificationStack, type NotificationStackItem } from "@/registry/ui/notification-stack"

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

const notices: NotificationStackItem[] = [
  { id: "note", title: "New message", body: "Inés sent a note.", time: "2m" },
  { id: "like", title: "Liked your post", body: "Mateo liked the log.", time: "8m" },
]

function front(container: HTMLElement) {
  const node = container.querySelector("[data-slot='notification-front']")
  if (!(node instanceof HTMLElement)) throw new Error("Missing front card")
  return node
}

function translateX(node: HTMLElement) {
  const source = `${node.style.transform} ${node.parentElement?.style.transform ?? ""}`
  const match = /translate(?:3d|X)\(\s*(-?[\d.]+)px/.exec(source)
  return match ? Number(match[1]) : 0
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

function point(node: HTMLElement, type: "pointerDown" | "pointerMove" | "pointerUp", x: number, timeStamp: number, pointerId = 1) {
  fireEvent[type](node, { pointerId, button: 0, pointerType: "touch", clientX: x, clientY: 20, timeStamp })
}

describe("notification-stack gesture", () => {
  it("no vuelve a renderizar en cada move y el transform es el del dedo", () => {
    let commits = 0
    const { container } = render(
      <Profiler id="stack" onRender={() => { commits += 1 }}>
        <NotificationStack defaultItems={notices} expandable={false} />
      </Profiler>,
    )
    const card = front(container)
    point(card, "pointerDown", 0, 0)
    const baseline = commits
    point(card, "pointerMove", 12, 16)
    point(card, "pointerMove", 24, 32)
    point(card, "pointerMove", 36, 48)
    expect(commits).toBe(baseline)
    expect(translateX(card)).toBe(36)
  })

  it("pasa la velocidad al spring y no declara keyframes de salida", () => {
    animateCalls.length = 0
    const { container } = render(
      <NotificationStack defaultItems={notices} expandable={false} dismissDistance={88} dismissVelocity={640} />,
    )
    const card = front(container)
    point(card, "pointerDown", 0, 0)
    point(card, "pointerMove", 40, 50)
    point(card, "pointerUp", 40, 50)
    const release = animateCalls.find((call) => {
      const options = call[2] as { type?: string; velocity?: number } | undefined
      return options?.type === "spring" && typeof options.velocity === "number" && options.velocity !== 0
    })
    expect(release).toBeTruthy()
    const source = readFileSync(path.join(process.cwd(), "registry/ui/notification-stack.tsx"), "utf8")
    expect(source).not.toMatch(/@keyframes\s+retana-notice-leave/)
  })

  it("descarta por velocidad por debajo de la distancia", () => {
    const onDismiss = vi.fn()
    const { container } = render(
      <NotificationStack defaultItems={notices} expandable={false} dismissDistance={88} dismissVelocity={640} onDismiss={onDismiss} />,
    )
    const card = front(container)
    point(card, "pointerDown", 0, 0)
    point(card, "pointerMove", 40, 50)
    point(card, "pointerUp", 40, 50)
    expect(onDismiss).toHaveBeenCalledWith("note")
  })

  it("un arrastre corto y lento no descarta", () => {
    const onDismiss = vi.fn()
    const { container } = render(
      <NotificationStack defaultItems={notices} expandable={false} dismissDistance={88} dismissVelocity={640} onDismiss={onDismiss} />,
    )
    const card = front(container)
    point(card, "pointerDown", 0, 0)
    point(card, "pointerMove", 40, 400)
    point(card, "pointerUp", 40, 400)
    expect(onDismiss).not.toHaveBeenCalled()
    expect(front(container)).toHaveTextContent("New message")
  })

  it("con reduced motion el dedo sigue y no hay spring", () => {
    const restore = reduceMotion()
    animateCalls.length = 0
    try {
      const { container } = render(<NotificationStack defaultItems={notices} expandable={false} />)
      const card = front(container)
      point(card, "pointerDown", 0, 0)
      point(card, "pointerMove", 30, 40)
      expect(translateX(card)).toBe(30)
      point(card, "pointerUp", 30, 80)
      expect(animateCalls).toHaveLength(0)
      expect(translateX(front(container))).toBe(0)
    } finally {
      restore()
    }
  })

  it("se retoma a mitad de la salida", () => {
    const onDismiss = vi.fn()
    const { container } = render(
      <NotificationStack defaultItems={notices} expandable={false} dismissDistance={88} onDismiss={onDismiss} />,
    )
    const card = front(container)
    point(card, "pointerDown", 0, 0)
    point(card, "pointerMove", 120, 200)
    point(card, "pointerUp", 120, 200)
    point(card, "pointerDown", 120, 220, 2)
    point(card, "pointerMove", 150, 240, 2)
    expect(onDismiss).not.toHaveBeenCalled()
    expect(front(container)).toHaveTextContent("New message")
    expect(translateX(front(container))).toBeGreaterThan(100)
  })

  it("la dirección contraria tiene goma", () => {
    const { container } = render(<NotificationStack defaultItems={notices} expandable={false} rubberLimit={96} />)
    const card = front(container)
    point(card, "pointerDown", 100, 0)
    point(card, "pointerMove", 60, 30)
    const offset = translateX(card)
    expect(offset).toBeLessThan(0)
    expect(offset).toBeGreaterThan(-40)
  })

  it("declara touch-pan-y en la tarjeta arrastrable", () => {
    const { container } = render(<NotificationStack defaultItems={notices} expandable={false} />)
    expect(front(container).className).toMatch(/touch-pan-y/)
  })

  it("las escenas PLP de gesto exportan dragging, dismissed y reduced", () => {
    const source = readFileSync(path.join(process.cwd(), "app/examples/notification-stack/scenes.tsx"), "utf8")
    expect(source).toMatch(/"dragging"/)
    expect(source).toMatch(/"dismissed"/)
    expect(source).toMatch(/"reduced"/)
  })
})
