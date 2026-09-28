import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import type { MediaAsset } from "@/registry/lib/admin-types"
import { MediaField } from "@/registry/ui/media-library"
import { SettingsForm } from "@/registry/ui/settings-form"
import { reconcileHomepageOverrides, SortableBoard } from "@/registry/ui/sortable-board"

const asset = (id: string, filename: string, mime: string): MediaAsset => ({
  id,
  filename,
  mime,
  size: 10,
  url: `/${filename}`,
  createdAt: "2026-01-01T00:00:00.000Z",
})

describe("MediaField library", () => {
  it("hides assets that do not match accept", async () => {
    const user = userEvent.setup()
    render(
      <MediaField
        label="Portada"
        value=""
        accept="image/*"
        assets={[asset("1", "foto.png", "image/png"), asset("2", "clip.mp4", "video/mp4")]}
        onChange={() => undefined}
        onUpload={async () => asset("1", "foto.png", "image/png")}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Library" }))

    expect(screen.getByRole("button", { name: /foto\.png/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /clip\.mp4/ })).not.toBeInTheDocument()
  })
})

describe("SettingsForm", () => {
  it("keeps the draft when values are reordered but unchanged", async () => {
    const user = userEvent.setup()
    const groups = [{ id: "site", title: "Sitio", fields: [{ key: "title", label: "Título" }] }]
    const { rerender } = render(
      <SettingsForm groups={groups} values={{ title: "A", tag: "x" }} onSave={async () => undefined} />,
    )

    await user.type(screen.getByLabelText("Título"), "!")
    rerender(
      <SettingsForm groups={groups} values={{ tag: "x", title: "A" }} onSave={async () => undefined} />,
    )

    expect(screen.getByLabelText("Título")).toHaveValue("A!")
  })
})

describe("reconcileHomepageOverrides", () => {
  const previous = "p\u00000"

  it("drops an override once the incoming flag changes", () => {
    expect(
      reconcileHomepageOverrides({ p: true }, previous, [{ id: "p", showOnHomepage: true }]),
    ).toEqual({})
  })

  it("keeps an override while the incoming flag is unchanged", () => {
    expect(
      reconcileHomepageOverrides({ p: true }, previous, [{ id: "p", showOnHomepage: false }]),
    ).toEqual({ p: true })
  })

  it("drops overrides for items that left", () => {
    expect(reconcileHomepageOverrides({ p: true, gone: false }, previous, [])).toEqual({})
  })
})

describe("SortableBoard homepage flag", () => {
  const item = {
    id: "p",
    title: "Lumen",
    categoryId: null,
    showOnHomepage: false,
  }

  it("shows a new showOnHomepage value after a local override", async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <SortableBoard
        items={[item]}
        categories={[]}
        onReorder={async () => undefined}
        onToggleHomepage={async () => undefined}
      />,
    )
    const toggle = screen.getByRole("switch", { name: "Homepage: Lumen" })
    expect(toggle).not.toBeChecked()

    await user.click(toggle)
    expect(toggle).toBeChecked()

    rerender(
      <SortableBoard
        items={[{ ...item, showOnHomepage: true }]}
        categories={[]}
        onReorder={async () => undefined}
        onToggleHomepage={async () => undefined}
      />,
    )
    rerender(
      <SortableBoard
        items={[{ ...item, showOnHomepage: false }]}
        categories={[]}
        onReorder={async () => undefined}
        onToggleHomepage={async () => undefined}
      />,
    )

    expect(screen.getByRole("switch", { name: "Homepage: Lumen" })).not.toBeChecked()
  })
})
