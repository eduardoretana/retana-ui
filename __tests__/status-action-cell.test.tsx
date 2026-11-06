import { readFileSync } from "node:fs"
import path from "node:path"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { StatusActionCell, statusActionAccessibleName } from "@/registry/ui/status-action-cell"
import { StatusActionCell as Reexported } from "@/registry/ui/work-table-cells"

vi.mock("sonner", () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() })
  return { toast }
})

describe("status-action-cell", () => {
  it("announces the status and the action labels together", () => {
    const name = statusActionAccessibleName("En pausa", [{ label: "Reanudar" }, { label: "Reintentar" }, { label: "Aprobar" }])
    expect(name).toBe("En pausa, Reanudar, Reintentar, Aprobar")
    render(
      <StatusActionCell
        label="En pausa"
        tone="warning"
        actions={[
          { id: "resume", label: "Reanudar", onClick: vi.fn() },
          { id: "retry", label: "Reintentar", onClick: vi.fn() },
          { id: "approve", label: "Aprobar", onClick: vi.fn() },
        ]}
      />,
    )
    expect(screen.getByRole("group", { name })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reanudar" })).toBeVisible()
  })

  it("keeps the fourth action in the menu", async () => {
    const user = userEvent.setup()
    const note = vi.fn()
    render(
      <StatusActionCell
        label="Paused"
        status="warning"
        moreLabel="More actions"
        actions={[
          { id: "resume", label: "Resume", onClick: vi.fn() },
          { id: "retry", label: "Retry", onClick: vi.fn() },
          { id: "approve", label: "Approve", onClick: vi.fn() },
          { id: "note", label: "Note", onClick: note },
        ]}
      />,
    )
    expect(screen.queryByRole("button", { name: "Note" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /More actions/ }))
    await user.click(screen.getByRole("menuitem", { name: "Note" }))
    expect(note).toHaveBeenCalledOnce()
  })

  it("marks a pending action with aria-busy and keeps it in the tab order", () => {
    render(
      <StatusActionCell
        label="En pausa"
        tone="warning"
        actions={[{ id: "resume", label: "Reanudar", pending: true, onClick: vi.fn() }]}
      />,
    )
    const button = screen.getByRole("button", { name: "Reanudar" })
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).not.toHaveAttribute("disabled")
  })

  it("shows an action failure as text", () => {
    render(
      <StatusActionCell
        label="Falló"
        tone="critical"
        error="No se pudo reanudar esta serie."
        actions={[{ id: "resume", label: "Reanudar", onClick: vi.fn() }]}
      />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo reanudar esta serie.")
  })

  it("collapses every action into one labelled menu", async () => {
    const user = userEvent.setup()
    render(
      <StatusActionCell
        collapse
        label="En pausa"
        tone="warning"
        menuLabel="Acciones"
        actions={[
          { id: "resume", label: "Reanudar", onClick: vi.fn() },
          { id: "retry", label: "Reintentar", onClick: vi.fn() },
        ]}
      />,
    )
    expect(screen.queryByRole("button", { name: "Reanudar" })).not.toBeInTheDocument()
    const menu = screen.getByRole("button", { name: /Acciones/ })
    expect(menu).toHaveAttribute("aria-label", "Acciones: Reanudar, Reintentar")
    await user.click(menu)
    expect(screen.getByRole("menuitem", { name: "Reanudar" })).toBeInTheDocument()
  })

  it("is the same component the work-table cells re-export", () => {
    expect(Reexported).toBe(StatusActionCell)
  })
})

describe("status-action-cell fixtures stay domain-free", () => {
  it("does not use paid-library domain copy", () => {
    const root = path.resolve(__dirname, "..")
    const banned = /\b(payouts?|attendance|tickets?|regional|budget|shadcn)\b/i
    for (const file of [
      "registry/ui/status-action-cell.tsx",
      "app/examples/status-action-cell/fixtures.ts",
      "app/examples/status-action-cell/scenes.tsx",
    ]) {
      expect(readFileSync(path.join(root, file), "utf8")).not.toMatch(banned)
    }
  })
})
