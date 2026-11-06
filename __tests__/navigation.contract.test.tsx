import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SidebarIslands, type NavSection } from "@/registry/ui/sidebar-islands"

/**
 * Navigation family contract.
 * A substitute keeps host-owned controls: collapsed + onCollapsedChange,
 * activeId + onNavigate, and teamId + onTeamChange. The piece does not persist them.
 */
const sections: NavSection[] = [
  { id: "bandeja", label: "Bandeja" },
  { id: "informes", label: "Informes", items: [{ id: "prospectos", label: "Prospectos" }] },
]

describe("navigation family contract", () => {
  it("exposes the controlled navigation surface", async () => {
    const user = userEvent.setup()
    const onCollapsedChange = vi.fn()
    const onNavigate = vi.fn()
    const onTeamChange = vi.fn()
    render(
      <SidebarIslands
        layout="rail"
        sections={sections}
        teams={[
          { id: "norte", name: "Taller Norte" },
          { id: "bajio", name: "Taller Bajío" },
        ]}
        teamId="norte"
        collapsed={false}
        activeId="bandeja"
        onCollapsedChange={onCollapsedChange}
        onNavigate={onNavigate}
        onTeamChange={onTeamChange}
      />,
    )
    expect(screen.getByRole("navigation", { name: "Navegación" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Bandeja/ })).toHaveAttribute("aria-current", "page")
    await user.click(screen.getByRole("button", { name: "Contraer la navegación" }))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    await user.click(screen.getByRole("button", { name: /Informes/ }))
    expect(onNavigate).toHaveBeenCalledWith("informes")
    await user.click(screen.getByRole("button", { name: /Equipo, Taller Norte/ }))
    await user.click(screen.getByRole("menuitem", { name: "Taller Bajío" }))
    expect(onTeamChange).toHaveBeenCalledWith("bajio")
  })
})
