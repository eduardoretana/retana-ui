import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { MultiView } from "@/registry/blocks/multi-view"
import type { FieldDef, MultiRecord, ViewConfig } from "@/registry/lib/multi-view"
import { RecordProperties } from "@/registry/ui/record-properties"
import { ViewCalendar } from "@/registry/ui/view-calendar"
import { ViewKanban } from "@/registry/ui/view-kanban"
import { ViewTimeline } from "@/registry/ui/view-timeline"

const fields: FieldDef[] = [
  { id: "name", label: "Name", type: "text", icon: "text", section: "Deal" },
  { id: "amount", label: "Amount", type: "currency", icon: "currency", section: "Deal" },
  {
    id: "stage",
    label: "Stage",
    type: "status",
    icon: "status",
    section: "Deal",
    options: [
      { value: "new", label: "New", tone: 1 },
      { value: "proposal", label: "Proposal", tone: 3 },
    ],
  },
  { id: "close", label: "Close", type: "date", icon: "calendar", section: "Deal" },
  { id: "start", label: "Start", type: "date", section: "Schedule" },
  { id: "end", label: "End", type: "date", section: "Schedule" },
  { id: "created", label: "Created", type: "date", section: "System", readOnly: true },
]

const views: ViewConfig[] = [
  { id: "table", kind: "table", label: "Table", titleField: "name" },
  { id: "board", kind: "kanban", label: "Board", titleField: "name", groupField: "stage", sumField: "amount" },
]

const rows: MultiRecord[] = [
  { id: "a", name: "Bruma", amount: 42000, stage: "new", close: "2026-03-15", start: "2026-04-01", end: "2026-04-10", created: "2026-01-01" },
  { id: "b", name: "Mesa", amount: 9000, stage: "proposal", close: "2026-03-18", start: "2026-04-02", end: "2026-04-12", created: "2026-01-02" },
]

describe("MultiView", () => {
  it("keeps search and selection when switching views", async () => {
    const user = userEvent.setup()
    render(<MultiView title="Opportunities" records={rows} fields={fields} views={views} locale="en-US" today="2026-03-15" />)
    await user.type(screen.getByRole("textbox", { name: "Search" }), "bruma")
    await user.click(screen.getByRole("checkbox", { name: "Select Bruma" }))
    expect(screen.getByText("1 selected")).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "Board" }))
    expect(screen.getByText("1 selected")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(screen.getByRole("textbox", { name: "Search" })).toHaveValue("bruma")
  })

  it("confirms bulk delete", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn(async () => undefined)
    render(
      <MultiView title="Opportunities" records={rows} fields={fields} views={views} locale="en-US" onDelete={onDelete} />,
    )
    await user.click(screen.getByRole("checkbox", { name: "Select Bruma" }))
    await user.click(screen.getByRole("button", { name: "Delete" }))
    await user.click(screen.getByRole("button", { name: "Delete records" }))
    expect(onDelete).toHaveBeenCalledWith(["a"])
  })
})

describe("ViewKanban", () => {
  it("moves a card with the keyboard and the menu", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn(async () => undefined)
    render(
      <ViewKanban records={rows} fields={fields} config={views[1]!} locale="en-US" onMove={onMove} />,
    )
    screen.getByRole("button", { name: "Bruma" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onMove).toHaveBeenCalledWith("a", { stage: "proposal" })
    await user.click(screen.getByRole("button", { name: "Actions for Bruma" }))
    await user.click(screen.getByRole("menuitem", { name: "New" }))
    expect(onMove).toHaveBeenCalledWith("a", { stage: "new" })
  })

  it("marks reduced motion", async () => {
    const original = window.matchMedia
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("reduce"),
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList
    render(<ViewKanban records={rows} fields={fields} config={views[1]!} />)
    await waitFor(() => {
      expect(document.querySelector("[data-reduced-motion='true']")).toBeTruthy()
    })
    window.matchMedia = original
  })
})

describe("ViewCalendar", () => {
  it("moves between days and reschedules with Alt+Arrow", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn(async () => undefined)
    render(
      <ViewCalendar
        records={rows}
        fields={fields}
        config={{ id: "cal", kind: "calendar", label: "Calendar", titleField: "name", dateField: "close" }}
        locale="en-US"
        today="2026-03-15"
        onMove={onMove}
      />,
    )
    const day = screen.getByRole("gridcell", { name: "Mar 15, 2026" })
    day.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("gridcell", { name: "Mar 16, 2026" })).toHaveFocus()
    screen.getByRole("button", { name: "Reschedule Bruma" }).focus()
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}")
    expect(onMove).toHaveBeenCalledWith("a", { close: "2026-03-16" })
  })
})

describe("ViewTimeline", () => {
  it("moves and resizes a bar from the keyboard", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn(async () => undefined)
    render(
      <ViewTimeline
        records={rows}
        fields={fields}
        config={{ id: "time", kind: "timeline", label: "Timeline", titleField: "name", startField: "start", endField: "end" }}
        locale="en-US"
        today="2026-04-03"
        zoom="day"
        onMove={onMove}
      />,
    )
    const bar = screen.getByRole("button", { name: "Bruma, Apr 1, 2026 to Apr 10, 2026" })
    bar.focus()
    await user.keyboard("{ArrowRight}")
    expect(onMove).toHaveBeenCalledWith("a", { start: "2026-04-02", end: "2026-04-11" })
    await user.keyboard("{Shift>}{ArrowRight}{/Shift}")
    expect(onMove).toHaveBeenCalledWith("a", { start: "2026-04-01", end: "2026-04-11" })
  })
})

function PropertiesHarness({ fail = false }: { fail?: boolean }) {
  const [record, setRecord] = useState<MultiRecord>(rows[0]!)
  return (
    <RecordProperties
      record={record}
      fields={fields}
      locale="en-US"
      onChange={async (_id, patch) => {
        if (fail) throw new Error("nope")
        setRecord((current) => ({ ...current, ...patch }))
      }}
    />
  )
}

describe("RecordProperties", () => {
  it("commits on Enter and cancels on Escape", async () => {
    const user = userEvent.setup()
    render(<PropertiesHarness />)
    await user.click(screen.getByRole("button", { name: "Bruma" }))
    const input = screen.getByRole("textbox", { name: "Name" })
    await user.clear(input)
    await user.type(input, "Nube")
    await user.keyboard("{Enter}")
    expect(screen.getByRole("button", { name: "Nube" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Nube" }))
    const again = screen.getByRole("textbox", { name: "Name" })
    await user.clear(again)
    await user.type(again, "Nope")
    await user.keyboard("{Escape}")
    expect(screen.getByRole("button", { name: "Nube" })).toBeInTheDocument()
  })

  it("rolls back when the promise rejects", async () => {
    const user = userEvent.setup()
    render(<PropertiesHarness fail />)
    await user.click(screen.getByRole("button", { name: "Bruma" }))
    const input = screen.getByRole("textbox", { name: "Name" })
    await user.clear(input)
    await user.type(input, "Nube")
    await user.keyboard("{Enter}")
    expect(await screen.findByRole("button", { name: "Bruma" })).toBeInTheDocument()
  })
})
