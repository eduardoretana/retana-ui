import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "next-themes"
import { describe, expect, it } from "vitest"

import { scenes } from "@/app/examples/toast-stack/scenes"
import { Toaster } from "@/components/ui/sonner"

describe("toast scene on load", () => {
  it("al cargar muestra varios toasts de la pila y uno de Sonner", async () => {
    const scene = scenes.find((item) => item.id === "al-cargar")
    expect(scene).toBeTruthy()
    const Render = scene!.render
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <Toaster />
        <Render locale="es" log={() => {}} />
      </ThemeProvider>,
    )
    expect(await screen.findByText("Pila uno")).toBeInTheDocument()
    expect(screen.getByText("Pila dos")).toBeInTheDocument()
    expect(screen.getByText("Pila tres")).toBeInTheDocument()
    expect(document.querySelectorAll("[data-slot=toast-stack-item]").length).toBeGreaterThanOrEqual(3)
    expect(await screen.findByText("Toaster del layout")).toBeInTheDocument()
    expect(document.querySelectorAll("[data-sonner-toast]").length).toBeGreaterThan(0)
  })
})
