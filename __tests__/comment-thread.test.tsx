import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CommentThread, type ThreadComment } from "@/registry/ui/comment-thread"

const me = { id: "ines", name: "Inés Calderón" }
const mateo = { id: "mateo", name: "Mateo Ruiz" }
const lucia = { id: "lucia", name: "Lucía Peña" }

const seed: ThreadComment = {
  id: "note",
  author: me,
  body: "El esmalte quedó claro.",
  createdAt: "2h",
  replies: [{ id: "reply", author: lucia, body: "Lo bajo mañana.", createdAt: "1h" }],
}

describe("CommentThread", () => {
  it("replies, edits, reacts, and resolves", async () => {
    const user = userEvent.setup()
    const onCommentsChange = vi.fn()
    const onResolvedChange = vi.fn()
    render(
      <CommentThread
        currentUser={me}
        people={[me, mateo, lucia]}
        defaultComments={[seed]}
        title="Esmalte"
        onCommentsChange={onCommentsChange}
        onResolvedChange={onResolvedChange}
      />,
    )

    expect(screen.getByRole("button", { name: "Hide replies" })).toHaveAttribute("aria-expanded", "true")
    await user.click(screen.getByRole("button", { name: "Hide replies" }))
    expect(screen.getByRole("button", { name: "Show 1 reply" })).toHaveAttribute("aria-expanded", "false")

    const note = screen.getByRole("article", { name: "Inés Calderón, 2h" })
    await user.click(within(note).getByRole("button", { name: "Reply" }))
    expect(screen.getByText(/Replying to/)).toBeInTheDocument()
    const field = screen.getByRole("combobox", { name: "Reply, or @mention someone" })
    await user.type(field, "@Mate")
    expect(await screen.findByRole("option", { name: /Mateo Ruiz/ })).toBeInTheDocument()
    await user.keyboard("{Enter}")
    expect(field).toHaveValue("@Mateo Ruiz ")
    await user.type(field, "¿lo ves?")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(onCommentsChange).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ type: "reply", parentId: "note" }))
    expect(screen.getByText(/@Mateo Ruiz/)).toBeInTheDocument()

    await user.click(within(note).getByRole("button", { name: "Edit" }))
    const edit = screen.getByRole("combobox", { name: "Edit comment" })
    await user.clear(edit)
    await user.type(edit, "Texto nuevo")
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(screen.getByText("Texto nuevo")).toBeInTheDocument()
    expect(screen.getByText(/edited/)).toBeInTheDocument()

    await user.click(within(note).getByRole("button", { name: "Add reaction" }))
    await user.click(await screen.findByRole("button", { name: "React with 👍" }))
    expect(screen.getByRole("button", { name: "👍 1, including you" })).toHaveAttribute("aria-pressed", "true")

    await user.click(screen.getByRole("button", { name: "Resolve" }))
    expect(onResolvedChange).toHaveBeenCalledWith(true)
    expect(await screen.findByRole("button", { name: "Reopen" })).toBeInTheDocument()
    expect(screen.getByText(/Resolved/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Reopen" }))
    expect(onResolvedChange).toHaveBeenCalledWith(false)
    expect(await screen.findByRole("button", { name: "Resolve" })).toBeInTheDocument()
  })

  it("keeps a deleted comment when it still has replies", async () => {
    const user = userEvent.setup()
    render(<CommentThread currentUser={me} people={[me, lucia]} defaultComments={[seed]} />)
    const note = screen.getByRole("article", { name: "Inés Calderón, 2h" })
    await user.click(within(note).getByRole("button", { name: "Delete" }))
    expect(await screen.findByText("Delete this comment?")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(screen.getByText("This comment was deleted")).toBeInTheDocument()
    expect(screen.getByText("Lo bajo mañana.")).toBeInTheDocument()
  })

  it("starts empty and sends with the modifier key", async () => {
    const user = userEvent.setup()
    render(<CommentThread currentUser={me} people={[me, mateo]} />)
    expect(screen.getByRole("button", { name: "Resolve" })).toBeDisabled()
    expect(screen.getByText("No comments yet. Start the conversation below.")).toBeInTheDocument()
    const field = screen.getByRole("combobox", { name: "Reply, or @mention someone" })
    await user.type(field, "Listo")
    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(screen.getByText("Listo")).toBeInTheDocument()
    expect(screen.getByText("Just now")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Resolve" })).toBeEnabled()
  })
})
