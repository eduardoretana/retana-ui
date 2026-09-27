import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StreamingText } from "@/registry/ui/streaming-text"

describe("StreamingText", () => {
  it("renders basic markdown immediately when animation is off", () => {
    render(<StreamingText animate={false} text={"## Titulo\n\n**Hola** y `codigo`"} />)
    expect(screen.getByRole("heading", { name: "Titulo" })).toBeInTheDocument()
    expect(screen.getByText("Hola").tagName).toBe("STRONG")
    expect(screen.getByText("codigo").tagName).toBe("CODE")
  })
})
