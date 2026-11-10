import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ChatThread } from "@/registry/ui/chat-thread"

describe("ChatThread card delivery", () => {
  it("aligns an outgoing card and shows its read receipt", () => {
    render(
      <ChatThread
        label="Hilo"
        messages={[
          {
            id: "cita",
            side: "outgoing",
            author: "Tú",
            time: "10:46",
            delivery: "read",
            deliveryLabel: "Leído",
            note: {
              title: "Cita agendada",
              detail: "Jueves 12 nov · 14:30 · 30 min",
              body: "Revisión de expediente.",
            },
          },
        ]}
      />,
    )

    const card = screen.getByText("Cita agendada").closest("[data-slot=message-bubble]")
    expect(card).toHaveAttribute("data-side", "outgoing")
    expect(card).toHaveAttribute("data-delivery", "read")
    expect(card?.className).toContain("justify-end")
    expect(screen.getByText("Leído")).toBeInTheDocument()
  })
})
