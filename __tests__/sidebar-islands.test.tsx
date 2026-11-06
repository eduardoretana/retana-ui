import type { ComponentProps } from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionConfig } from "motion/react"
import { describe, expect, it, vi } from "vitest"

import { islandSections, islandTeams, rail, role } from "@/app/examples/sidebar-islands/fixtures"
import {
  PREVIEW_INTENT_MS,
  SidebarIslands,
  formatNavCount,
  islandMotion,
  sidebarIslandsLabels,
  type NavSection,
} from "@/registry/ui/sidebar-islands"

const labels = sidebarIslandsLabels

function sections(): NavSection[] {
  return islandSections(rail.sections, "es").map((section) => ({
    ...section,
    icon: <span aria-hidden>◦</span>,
  }))
}

function renderNav(props: Partial<ComponentProps<typeof SidebarIslands>> = {}) {
  return render(<SidebarIslands layout="rail" sections={sections()} teams={islandTeams("es")} teamId="norte" labels={labels} {...props} />)
}

describe("sidebar islands", () => {
  it("formats large counts for es-MX and en", () => {
    expect(formatNavCount(12840, "es-MX")).toBe("12,840")
    expect(formatNavCount(12840, "en")).toBe("12,840")
    expect(islandMotion(true)).toMatchObject({ duration: 0 })
    expect(islandMotion(false).duration).toBe(0.24)
  })

  it("reports collapse, navigation, and team through the host", async () => {
    const user = userEvent.setup()
    const onCollapsedChange = vi.fn()
    const onNavigate = vi.fn()
    const onTeamChange = vi.fn()
    const setItem = vi.spyOn(Storage.prototype, "setItem")
    renderNav({ collapsed: false, onCollapsedChange, onNavigate, onTeamChange, activeId: "bandeja" })
    expect(screen.getByRole("navigation", { name: labels.navigation })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: labels.collapse }))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    await user.click(screen.getByRole("button", { name: /Bandeja/ }))
    expect(onNavigate).toHaveBeenCalledWith("bandeja")
    await user.click(screen.getByRole("button", { name: /Equipo, Taller Norte/ }))
    await user.click(screen.getByRole("menuitem", { name: /Taller Bajío/ }))
    expect(onTeamChange).toHaveBeenCalledWith("bajio")
    expect(setItem).not.toHaveBeenCalled()
    setItem.mockRestore()
  })

  it("opens a section with the keyboard and does not take focus on hover", () => {
    vi.useFakeTimers()
    const outside = document.createElement("button")
    outside.textContent = "Fuera"
    document.body.append(outside)
    render(
      <MotionConfig reducedMotion="never">
        <SidebarIslands layout="rail" sections={sections()} teams={islandTeams("es")} teamId="norte" labels={labels} defaultCollapsed />
      </MotionConfig>,
    )
    const informes = screen.getByRole("button", { name: /Informes/ })
    outside.focus()
    fireEvent.pointerEnter(informes, { pointerType: "mouse" })
    act(() => {
      vi.advanceTimersByTime(PREVIEW_INTENT_MS - 40)
    })
    expect(screen.queryByRole("tree", { name: "Informes" })).not.toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(40)
    })
    expect(screen.getByRole("tree", { name: "Informes" })).toBeInTheDocument()
    expect(outside).toHaveFocus()
    fireEvent.keyDown(window, { key: "Escape" })
    expect(screen.queryByRole("tree", { name: "Informes" })).not.toBeInTheDocument()
    expect(outside).toHaveFocus()
    act(() => {
      informes.focus()
    })
    expect(screen.getByRole("tree", { name: "Informes" })).toBeInTheDocument()
    expect(informes).toHaveFocus()
    fireEvent.keyDown(informes, { key: "ArrowRight" })
    expect(screen.getByRole("treeitem", { name: /Prospectos/ })).toHaveFocus()
    outside.remove()
    vi.useRealTimers()
  })

  it("ignores hover on touch and opens on tap", () => {
    vi.useFakeTimers()
    renderNav({ defaultCollapsed: true })
    const informes = screen.getByRole("button", { name: /Informes/ })
    fireEvent.pointerEnter(informes, { pointerType: "touch" })
    act(() => {
      vi.advanceTimersByTime(PREVIEW_INTENT_MS + 50)
    })
    expect(screen.queryByRole("tree")).not.toBeInTheDocument()
    fireEvent.click(informes)
    expect(screen.getByRole("tree", { name: "Informes" })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it("walks three levels from the keyboard", async () => {
    const user = userEvent.setup()
    renderNav({ defaultCollapsed: false, defaultOpenIds: [] })
    const informes = screen.getByRole("button", { name: /Informes/ })
    informes.focus()
    await user.keyboard("{ArrowRight}")
    expect(informes).toHaveAttribute("aria-expanded", "true")
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: /Prospectos/ })).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    const ventas = screen.getByRole("button", { name: /^Ventas/ })
    expect(ventas).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    await user.keyboard("{ArrowRight}")
    await user.keyboard("{ArrowRight}")
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: /Semana 14/ })).toHaveFocus()
  })

  it("hides sections for a role and shows a large count", () => {
    render(<SidebarIslands layout="rail" sections={islandSections(role.sections, "es")} labels={labels} />)
    expect(screen.queryByRole("button", { name: /Automatizaciones/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Favoritos/ })).not.toBeInTheDocument()
    expect(screen.getByText("12,840")).toBeInTheDocument()
  })

  it("shows loading, empty, and error", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onEmptyAction = vi.fn()
    const { rerender } = render(<SidebarIslands layout="rail" status="loading" labels={labels} />)
    expect(screen.getByRole("status")).toHaveTextContent(labels.loading)
    rerender(<SidebarIslands layout="rail" status="empty" labels={labels} onEmptyAction={onEmptyAction} />)
    expect(screen.getByText(labels.emptyTitle)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: labels.emptyAction }))
    expect(onEmptyAction).toHaveBeenCalledOnce()
    rerender(<SidebarIslands layout="rail" status="error" labels={labels} onRetry={onRetry} />)
    expect(screen.getByRole("alert")).toHaveTextContent(labels.errorTitle)
    await user.click(screen.getByRole("button", { name: labels.retry }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("opens the mobile sheet on tap", async () => {
    const user = userEvent.setup()
    render(<SidebarIslands layout="sheet" sections={sections()} labels={labels} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: labels.openMenu }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: labels.navigation })).toBeInTheDocument()
  })

  it("collapses immediately when motion is reduced", async () => {
    const user = userEvent.setup()
    render(
      <MotionConfig reducedMotion="always">
        <SidebarIslands layout="rail" defaultCollapsed={false} sections={sections().slice(0, 1)} labels={labels} />
      </MotionConfig>,
    )
    const root = screen.getByRole("navigation").closest("[data-slot='sidebar-islands']")
    expect(root).toHaveAttribute("data-motion", "reduced")
    await user.click(screen.getByRole("button", { name: labels.collapse }))
    expect(root).toHaveAttribute("data-collapsed", "true")
    expect(root).toHaveAttribute("data-mask", "closed")
  })

  it("renders fifty rows without dropping the long name", () => {
    const token = "N".repeat(60)
    const many: NavSection[] = Array.from({ length: 50 }, (_, index) => ({
      id: `n-${index}`,
      label: index === 0 ? token : `Cuenta ${index}`,
    }))
    render(<SidebarIslands layout="rail" sections={many} labels={labels} />)
    expect(screen.getAllByRole("button", { name: /Cuenta|N{60}/ })).toHaveLength(50)
    expect(screen.getByTitle(token)).toBeInTheDocument()
  })

  it("opens the profile popover above the trigger", async () => {
    const user = userEvent.setup()
    const onSignOut = vi.fn()
    renderNav({
      profile: {
        name: "Camila Ortega",
        email: "camila.ortega@taller-norte.example",
        plan: "Equipo",
        onSignOut,
        onThemeChange: vi.fn(),
        theme: "system",
      },
    })
    await user.click(screen.getByRole("button", { name: /Menú de la cuenta, Camila Ortega/ }))
    expect(screen.getByRole("dialog", { name: labels.account })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: labels.signOut }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })
})
