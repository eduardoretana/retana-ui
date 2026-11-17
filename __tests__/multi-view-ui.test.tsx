import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { MultiView } from "@/registry/blocks/multi-view"
import type { FieldDef, MultiRecord, ViewConfig } from "@/registry/lib/multi-view"
import { RecordProperties } from "@/registry/ui/record-properties"
import { ViewCalendar } from "@/registry/ui/view-calendar"
import { ViewKanban } from "@/registry/ui/view-kanban"
import { ViewTimeline } from "@/registry/ui/view-timeline"
import { touchIntent, TOUCH_HOLD_MS } from "@/registry/ui/multi-view-fields"

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

  it("does not move a card when readOnly", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn(async () => undefined)
    render(
      <ViewKanban records={rows} fields={fields} config={views[1]!} locale="en-US" readOnly onMove={onMove} />,
    )
    expect(screen.getByRole("button", { name: "Drag Bruma" })).toBeDisabled()
    screen.getByRole("button", { name: "Bruma" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onMove).not.toHaveBeenCalled()
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

describe("touch intent", () => {
  it("opens on a still release, scrolls on a vertical move, and holds only after the delay", () => {
    expect(touchIntent({ dx: 1, dy: 1, elapsedMs: 40, released: true })).toBe("tap")
    expect(touchIntent({ dx: 2, dy: 30, elapsedMs: 20, released: false })).toBe("scroll")
    expect(touchIntent({ dx: 0, dy: 0, elapsedMs: TOUCH_HOLD_MS, released: false })).toBe("hold")
    expect(touchIntent({ dx: 24, dy: 2, elapsedMs: 30, released: false })).toBe("cancel")
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

  it("does not reschedule when readOnly", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn(async () => undefined)
    render(
      <ViewCalendar
        records={rows}
        fields={fields}
        config={{ id: "cal", kind: "calendar", label: "Calendar", titleField: "name", dateField: "close" }}
        locale="en-US"
        today="2026-03-15"
        readOnly
        onMove={onMove}
      />,
    )
    screen.getByRole("button", { name: "Reschedule Bruma" }).focus()
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}")
    expect(onMove).not.toHaveBeenCalled()
  })

  it("opens on the first tap, for a mouse click and a touch tap", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const onMove = vi.fn(async () => undefined)
    render(
      <ViewCalendar
        records={rows}
        fields={fields}
        config={{ id: "cal", kind: "calendar", label: "Calendar", titleField: "name", dateField: "close" }}
        locale="en-US"
        today="2026-03-15"
        onOpen={onOpen}
        onMove={onMove}
      />,
    )
    const chip = screen.getByRole("button", { name: "Reschedule Bruma" })
    await user.click(chip)
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith("a")
    fireEvent.pointerDown(chip, { pointerType: "touch", pointerId: 4, clientX: 8, clientY: 8 })
    fireEvent.pointerUp(chip, { pointerType: "touch", pointerId: 4, clientX: 8, clientY: 8 })
    fireEvent.click(chip)
    expect(onOpen).toHaveBeenCalledTimes(2)
    expect(onMove).not.toHaveBeenCalled()
    expect(chip.className).toContain("touch-pan-y")
    expect(chip.className).not.toContain("touch-none")
  })

  it("lets a vertical touch swipe scroll without moving the event", () => {
    const onOpen = vi.fn()
    const onMove = vi.fn(async () => undefined)
    render(
      <ViewCalendar
        records={rows}
        fields={fields}
        config={{ id: "cal", kind: "calendar", label: "Calendar", titleField: "name", dateField: "close" }}
        locale="en-US"
        today="2026-03-15"
        onOpen={onOpen}
        onMove={onMove}
      />,
    )
    const chip = screen.getByRole("button", { name: "Reschedule Bruma" })
    fireEvent.pointerDown(chip, { pointerType: "touch", pointerId: 5, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(chip, { pointerType: "touch", pointerId: 5, clientX: 12, clientY: 48 })
    fireEvent.pointerUp(chip, { pointerType: "touch", pointerId: 5, clientX: 12, clientY: 48 })
    expect(onOpen).not.toHaveBeenCalled()
    expect(onMove).not.toHaveBeenCalled()
    expect(chip).toHaveAttribute("data-gesture", "ready")
    expect(chip.className).not.toContain("touch-none")
  })

  it("moves the event after a long-press drag and not before", async () => {
    vi.useFakeTimers()
    const onOpen = vi.fn()
    const onMove = vi.fn(async () => undefined)
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 40,
      height: 96,
      top: 0,
      left: 0,
      bottom: 96,
      right: 40,
      x: 0,
      y: 0,
      toJSON() {
        return {}
      },
    } as DOMRect)
    render(
      <ViewCalendar
        records={rows}
        fields={fields}
        config={{ id: "cal", kind: "calendar", label: "Calendar", titleField: "name", dateField: "close" }}
        locale="en-US"
        today="2026-03-15"
        onOpen={onOpen}
        onMove={onMove}
      />,
    )
    const chip = screen.getByRole("button", { name: "Reschedule Bruma" })
    fireEvent.pointerDown(chip, { pointerType: "touch", pointerId: 6, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(chip, { pointerType: "touch", pointerId: 6, clientX: 60, clientY: 10 })
    fireEvent.pointerUp(chip, { pointerType: "touch", pointerId: 6, clientX: 60, clientY: 10 })
    expect(onMove).not.toHaveBeenCalled()
    fireEvent.pointerDown(chip, { pointerType: "touch", pointerId: 6, clientX: 10, clientY: 10 })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TOUCH_HOLD_MS)
    })
    expect(chip).toHaveAttribute("data-gesture", "holding")
    expect(chip.className).toContain("touch-none")
    fireEvent.pointerUp(chip, { pointerType: "touch", pointerId: 6, clientX: 60, clientY: 12 })
    expect(onMove).toHaveBeenCalledWith("a", { close: "2026-03-16" })
    expect(onOpen).not.toHaveBeenCalled()
    rect.mockRestore()
    vi.useRealTimers()
  })
})

describe("ViewTimeline", () => {
  it("opens a bar on the first touch tap", () => {
    const onOpen = vi.fn()
    const onMove = vi.fn(async () => undefined)
    render(
      <ViewTimeline
        records={rows}
        fields={fields}
        config={{ id: "time", kind: "timeline", label: "Timeline", titleField: "name", startField: "start", endField: "end" }}
        locale="en-US"
        today="2026-04-03"
        zoom="day"
        onOpen={onOpen}
        onMove={onMove}
      />,
    )
    const bar = screen.getByRole("button", { name: "Bruma, Apr 1, 2026 to Apr 10, 2026" })
    fireEvent.pointerDown(bar, { pointerType: "touch", pointerId: 2, clientX: 4, clientY: 4 })
    fireEvent.pointerUp(bar, { pointerType: "touch", pointerId: 2, clientX: 5, clientY: 5 })
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith("a")
    expect(onMove).not.toHaveBeenCalled()
    expect(bar.className).toContain("touch-pan-y")
  })

  it("lets a vertical touch swipe scroll without moving the bar", () => {
    const onOpen = vi.fn()
    const onMove = vi.fn(async () => undefined)
    render(
      <ViewTimeline
        records={rows}
        fields={fields}
        config={{ id: "time", kind: "timeline", label: "Timeline", titleField: "name", startField: "start", endField: "end" }}
        locale="en-US"
        today="2026-04-03"
        zoom="day"
        onOpen={onOpen}
        onMove={onMove}
      />,
    )
    const bar = screen.getByRole("button", { name: "Bruma, Apr 1, 2026 to Apr 10, 2026" })
    fireEvent.pointerDown(bar, { pointerType: "touch", pointerId: 3, clientX: 10, clientY: 8 })
    fireEvent.pointerMove(bar, { pointerType: "touch", pointerId: 3, clientX: 12, clientY: 40 })
    fireEvent.pointerUp(bar, { pointerType: "touch", pointerId: 3, clientX: 12, clientY: 40 })
    expect(onOpen).not.toHaveBeenCalled()
    expect(onMove).not.toHaveBeenCalled()
    expect(bar.className).not.toContain("touch-none")
  })

  it("moves a bar only after a long-press drag", async () => {
    vi.useFakeTimers()
    const onOpen = vi.fn()
    const onMove = vi.fn(async () => undefined)
    render(
      <ViewTimeline
        records={rows}
        fields={fields}
        config={{ id: "time", kind: "timeline", label: "Timeline", titleField: "name", startField: "start", endField: "end" }}
        locale="en-US"
        today="2026-04-03"
        zoom="day"
        onOpen={onOpen}
        onMove={onMove}
      />,
    )
    const bar = screen.getByRole("button", { name: "Bruma, Apr 1, 2026 to Apr 10, 2026" })
    fireEvent.pointerDown(bar, { pointerType: "touch", pointerId: 8, clientX: 0, clientY: 4 })
    fireEvent.pointerUp(bar, { pointerType: "touch", pointerId: 8, clientX: 40, clientY: 4 })
    expect(onMove).not.toHaveBeenCalled()
    fireEvent.pointerDown(bar, { pointerType: "touch", pointerId: 8, clientX: 0, clientY: 4 })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TOUCH_HOLD_MS)
    })
    expect(bar).toHaveAttribute("data-gesture", "holding")
    fireEvent.pointerUp(bar, { pointerType: "touch", pointerId: 8, clientX: 28, clientY: 6 })
    expect(onMove).toHaveBeenCalledWith("a", { start: "2026-04-02", end: "2026-04-11" })
    expect(onOpen).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

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

  it("does not move a bar when readOnly", async () => {
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
        readOnly
        onMove={onMove}
      />,
    )
    const bar = screen.getByRole("button", { name: "Bruma, Apr 1, 2026 to Apr 10, 2026" })
    bar.focus()
    await user.keyboard("{ArrowRight}")
    expect(onMove).not.toHaveBeenCalled()
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
