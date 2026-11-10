import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SegmentedFilter } from "@/registry/ui/segmented-filter"

const long = [
  { value: "all", label: "All conversations" },
  { value: "leads", label: "Open leads this quarter" },
  { value: "clients", label: "Active clients" },
  { value: "unread", label: "Unread messages" },
  { value: "mine", label: "Assigned to me this week" },
]

afterEach(() => {
  vi.restoreAllMocks()
})

describe("SegmentedFilter", () => {
  it("scrolls a crowded row without cutting a label in half", () => {
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function scrollWidth(this: HTMLElement) {
      return this.dataset.slot === "segmented-control-track" ? 720 : 0
    })
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function clientWidth(this: HTMLElement) {
      return this.dataset.slot === "segmented-control-track" ? 220 : 0
    })
    vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function offsetLeft(this: HTMLElement) {
      return this.dataset.value === "mine" ? 560 : 0
    })
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function offsetWidth(this: HTMLElement) {
      return this.dataset.value ? 140 : 0
    })
    const scrollTo = vi.fn()
    HTMLElement.prototype.scrollTo = scrollTo

    render(
      <div style={{ width: 220 }}>
        <SegmentedFilter label="Filter" value="mine" options={long} />
      </div>,
    )

    for (const option of long) {
      const button = screen.getByRole("button", { name: option.label })
      expect(button).toHaveTextContent(option.label)
      expect(button.className).toContain("whitespace-nowrap")
      expect(button.className).not.toMatch(/\btruncate\b|text-ellipsis/)
    }

    const root = document.querySelector("[data-slot=segmented-control]")
    const rootClasses = root?.className.split(/\s+/) ?? []
    expect(rootClasses).toContain("w-full")
    expect(rootClasses).not.toContain("inline-flex")

    const track = document.querySelector("[data-slot=segmented-control-track]") as HTMLElement
    expect(track.dataset.overflow).toBe("true")
    expect(track.style.maskImage).toContain("linear-gradient")
    expect(scrollTo).toHaveBeenCalled()
    const left = scrollTo.mock.calls.at(-1)?.[0]?.left as number
    expect(left).toBeGreaterThan(0)
  })

  it("stays compact, without a fade, when every option fits", () => {
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function scrollWidth(this: HTMLElement) {
      return this.dataset.slot === "segmented-control-track" ? 180 : 0
    })
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function clientWidth(this: HTMLElement) {
      return this.dataset.slot === "segmented-control-track" ? 180 : 0
    })

    render(
      <SegmentedFilter
        label="Filter"
        value="all"
        options={[
          { value: "all", label: "All" },
          { value: "unread", label: "Unread" },
        ]}
      />,
    )

    const track = document.querySelector("[data-slot=segmented-control-track]") as HTMLElement
    expect(track.dataset.overflow).toBe("false")
    expect(track.style.maskImage).toBe("")
    expect(screen.getByRole("button", { name: "Unread" })).toHaveTextContent("Unread")
  })
})
