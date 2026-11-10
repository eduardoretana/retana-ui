import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { scenes } from "@/app/examples/inbox-crm/scenes"
import { MessageBubble } from "@/registry/ui/message-bubble"

describe("delivery receipts", () => {
  it("marks a sent message with one check and a delivered message with two", () => {
    render(
      <div>
        <MessageBubble side="outgoing" author="Tú" time="10:40" delivery="sent" deliveryLabel="Enviado">
          Va el primero.
        </MessageBubble>
        <MessageBubble side="outgoing" author="Tú" time="10:41" delivery="delivered" deliveryLabel="Entregado">
          Va el segundo.
        </MessageBubble>
      </div>,
    )

    const sent = screen.getByText("Va el primero.").closest("[data-slot=message-bubble]")
    const delivered = screen.getByText("Va el segundo.").closest("[data-slot=message-bubble]")
    expect(sent).toHaveAttribute("data-delivery", "sent")
    expect(delivered).toHaveAttribute("data-delivery", "delivered")
    expect(screen.getByText("Enviado")).toBeInTheDocument()
    expect(screen.getByText("Entregado")).toBeInTheDocument()
    expect(sent?.querySelectorAll("svg")).toHaveLength(1)
    expect(delivered?.querySelectorAll("svg")).toHaveLength(1)
  })

  it("shows sent, delivered, and read together in the receipts scene", () => {
    const scene = scenes.find((item) => item.id === "receipts")
    expect(scene).toBeDefined()
    const Render = scene!.render
    render(<Render locale="es" log={() => {}} />)
    expect(screen.getByText("Enviado").closest("[data-slot=message-bubble]")).toHaveAttribute("data-delivery", "sent")
    expect(screen.getByText("Entregado").closest("[data-slot=message-bubble]")).toHaveAttribute("data-delivery", "delivered")
    expect(screen.getByText("Leído").closest("[data-slot=message-bubble]")).toHaveAttribute("data-delivery", "read")
  })
})
