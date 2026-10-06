import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TicketProperties } from "@/registry/ui/ticket-properties"

describe("TicketProperties", () => {
  it("paints an overdue due date in the destructive tone", () => {
    render(
      <TicketProperties
        today="2026-10-06"
        due="2026-10-01"
        priority="urgent"
        priorityOptions={[
          { value: "urgent", label: "Urgente" },
          { value: "low", label: "Baja" },
        ]}
        sla={{ text: "Respuesta en el día", overdue: true }}
        channel="Correo"
        tags={["horno"]}
      />,
    )
    const due = document.querySelector("[data-slot='ticket-due']")
    expect(due).toHaveAttribute("data-overdue", "true")
    expect(due).toHaveClass("text-destructive")
    expect(due).toHaveTextContent("Overdue")
    expect(document.querySelector("[data-slot='ticket-sla']")).toHaveAttribute("data-overdue", "true")
    expect(screen.getByText("Respuesta en el día")).toHaveClass("text-destructive")
    expect(screen.getByText("Correo")).toBeInTheDocument()
    expect(screen.getByText("horno")).toBeInTheDocument()
  })
})
