import { fireEvent, render, screen } from "@testing-library/react"
import { ThemeProvider } from "next-themes"
import { toast } from "sonner"
import { describe, expect, it } from "vitest"

import { Toaster } from "@/components/ui/sonner"

describe("layout toaster swipe", () => {
  it("no arrastra: el swipe de Sonner 2.0.8 no se puede retomar y queda delegado", async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <Toaster />
      </ThemeProvider>,
    )
    toast("Horno listo", { duration: Infinity })
    const node = await screen.findByText("Horno listo")
    const item = node.closest("li")
    if (!(item instanceof HTMLElement)) throw new Error("Missing sonner toast")
    fireEvent.pointerDown(item, { button: 0, pointerId: 3, pointerType: "touch", clientX: 0, clientY: 40, timeStamp: 0 })
    fireEvent.pointerMove(item, { pointerId: 3, pointerType: "touch", clientX: 30, clientY: 40, timeStamp: 16 })
    fireEvent.pointerMove(item, { pointerId: 3, pointerType: "touch", clientX: 80, clientY: 42, timeStamp: 32 })
    expect(item.style.getPropertyValue("--swipe-amount-x")).toBe("0px")
    expect(item.style.getPropertyValue("--swipe-amount-y")).toBe("0px")
  })
})
