import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { crmDemoCompanies, crmDemoNotices, crmDemoOwners } from "@/registry/lib/crm-demo-data"
import { CrmCommandMenu } from "@/registry/ui/crm-command-menu"
import { CrmCompaniesTable } from "@/registry/ui/crm-companies-table"
import { CrmCompanyDetail } from "@/registry/ui/crm-company-detail"
import { CrmNewCompanyDialog } from "@/registry/ui/crm-new-company-dialog"
import { CrmNotifications } from "@/registry/ui/crm-notifications"
import { CrmToolbar } from "@/registry/ui/crm-toolbar"
import { CrmDashboard } from "@/registry/blocks/crm-dashboard"

const rows = crmDemoCompanies.slice(0, 3)

describe("CrmCompaniesTable", () => {
  it("sorts, selects a page, and exports the chosen rows", async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    const onRowOpen = vi.fn()
    render(<CrmCompaniesTable rows={rows} pageSize={2} onExport={onExport} onRowOpen={onRowOpen} />)

    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "ascending")
    await user.click(screen.getByRole("button", { name: /Pipeline/ }))
    expect(screen.getByRole("columnheader", { name: /Pipeline/ })).toHaveAttribute("aria-sort", "ascending")

    await user.click(screen.getByRole("checkbox", { name: "Select all on this page" }))
    expect(screen.getByText(/2 selected/)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /open Hornos del Valle/ }))
    expect(onRowOpen).toHaveBeenCalledWith(expect.objectContaining({ id: "valle" }))

    await user.click(screen.getByRole("button", { name: "Export CSV" }))
    expect(onExport).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: "valle" })]))
    expect(onExport.mock.calls[0][0]).toHaveLength(2)
  })

  it("shows the empty state", () => {
    render(<CrmCompaniesTable rows={[]} />)
    expect(screen.getByText("No companies")).toBeInTheDocument()
  })
})

describe("CrmToolbar", () => {
  it("changes the segment and toggles a facet in the sheet", async () => {
    const user = userEvent.setup()
    const onSegmentChange = vi.fn()
    const onSelectionChange = vi.fn()
    render(
      <CrmToolbar
        layout="sheet"
        query=""
        onQueryChange={() => {}}
        segment="all"
        onSegmentChange={onSegmentChange}
        selection={{}}
        onSelectionChange={onSelectionChange}
        facets={[{ id: "region", label: "Region", options: [{ value: "Oaxaca", label: "Oaxaca" }] }]}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Lead" }))
    expect(onSegmentChange).toHaveBeenCalledWith("lead")
    await user.click(screen.getByRole("button", { name: "Open filters" }))
    await user.click(screen.getByRole("checkbox", { name: "Oaxaca" }))
    expect(onSelectionChange).toHaveBeenCalledWith({ region: ["Oaxaca"] })
  })
})

describe("CrmCompanyDetail", () => {
  it("shows the score, the health meter, and a detail section", () => {
    render(<CrmCompanyDetail company={rows[0]} open onOpenChange={() => {}} />)
    expect(screen.getByRole("dialog", { name: "Hornos del Valle" })).toBeInTheDocument()
    expect(screen.getByText("Score")).toBeInTheDocument()
    expect(screen.getByText("Pipeline health")).toBeInTheDocument()
    expect(screen.getByText("Cerámica")).toBeInTheDocument()
  })
})

describe("CrmCommandMenu", () => {
  it("filters the result table and selects a company", async () => {
    const user = userEvent.setup()
    const onSelectCompany = vi.fn()
    render(<CrmCommandMenu companies={rows} open onOpenChange={() => {}} onSelectCompany={onSelectCompany} hotkey={false} />)
    await user.type(screen.getByRole("combobox", { name: "Search companies" }), "lince")
    expect(screen.queryByText("Hornos del Valle")).not.toBeInTheDocument()
    await user.click(screen.getByText("Papelería Lince"))
    expect(onSelectCompany).toHaveBeenCalledWith(expect.objectContaining({ id: "lince" }))
  })
})

describe("CrmNewCompanyDialog", () => {
  it("blocks an empty submit and accepts a complete draft", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <CrmNewCompanyDialog
        open
        onOpenChange={() => {}}
        statuses={[{ value: "lead", label: "Lead" }]}
        owners={crmDemoOwners.map((owner) => ({ value: owner.id, label: owner.name }))}
        onSubmit={onSubmit}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Save company" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Fix the highlighted fields")
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/Name/), "Taller Norte")
    await user.type(screen.getByLabelText(/Pipeline value/), "800")
    await user.click(screen.getByRole("combobox", { name: /Status/ }))
    await user.click(screen.getByRole("option", { name: "Lead" }))
    await user.click(screen.getByRole("combobox", { name: /Owner/ }))
    await user.click(screen.getByRole("option", { name: "Elena Voss" }))
    await user.click(screen.getByRole("button", { name: "Save company" }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: "Taller Norte", status: "lead", ownerId: "elena", pipelineValue: "800" }))
  })
})

describe("CrmNotifications", () => {
  it("marks a notice read from the popover", async () => {
    const user = userEvent.setup()
    const onItemsChange = vi.fn()
    render(<CrmNotifications items={crmDemoNotices.slice(0, 2)} onItemsChange={onItemsChange} />)
    await user.click(screen.getByRole("button", { name: /2 unread/ }))
    await user.click(screen.getByRole("button", { name: /Llamada anotada/ }))
    const next = onItemsChange.mock.calls[0]?.[0] as { id: string; read?: boolean }[]
    expect(next.find((notice) => notice.id === "llamada")?.read).toBe(true)
    expect(next.find((notice) => notice.id === "alcance")?.read).toBeUndefined()
  })
})

describe("CrmDashboard", () => {
  it("filters the book and opens a company from the table", async () => {
    const user = userEvent.setup()
    render(<CrmDashboard companies={rows} notices={crmDemoNotices.slice(0, 1)} />)
    const search = screen.getByRole("searchbox", { name: "Buscar empresas" })
    await user.type(search, "Lince")
    expect(screen.queryByRole("button", { name: /Hornos del Valle/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Papelería Lince/ }))
    const dialog = screen.getByRole("dialog", { name: "Papelería Lince" })
    expect(within(dialog).getByText("Salud del pipeline")).toBeInTheDocument()
  })
})
