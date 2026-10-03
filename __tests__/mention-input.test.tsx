import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { MentionInput, serializeMentions } from "@/registry/ui/mention-input"
import { channels, people } from "@/app/examples/arc/demo-data"

const channelItems = channels.map((name, index) => ({ id: name, name, description: "Studio", members: index + 1 }))

describe("MentionInput", () => {
  it("inserts a person token from suggestions at the caret", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onMentionAdd = vi.fn()
    render(<MentionInput aria-label="Note" people={people} channels={channelItems} onChange={onChange} onMentionAdd={onMentionAdd} />)
    const field = screen.getByRole("combobox", { name: "Note" })
    await user.type(field, "Hola @In")
    expect(await screen.findByRole("option", { name: /Inés Calderón/ })).toBeInTheDocument()
    await user.keyboard("{Enter}")
    expect(field).toHaveValue("Hola @Inés Calderón ")
    expect(onMentionAdd).toHaveBeenCalledWith(expect.objectContaining({ kind: "person", id: "ines", label: "Inés Calderón" }))
    const last = onChange.mock.calls.at(-1)?.[0]
    expect(serializeMentions(last)).toBe("Hola <@ines> ")
  })

  it("offers channels after a hash and removes the whole token with backspace", async () => {
    const user = userEvent.setup()
    render(<MentionInput aria-label="Note" people={people} channels={channelItems} />)
    const field = screen.getByRole("combobox", { name: "Note" })
    await user.type(field, "#kil")
    await user.click(await screen.findByRole("option", { name: /kiln/ }))
    expect(field).toHaveValue("#kiln ")
    await user.type(field, "{Backspace}{Backspace}")
    expect(field).toHaveValue("")
  })

  it("submits on enter when asked and keeps shift-enter as a newline", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MentionInput aria-label="Note" people={people} submitOnEnter onSubmit={onSubmit} />)
    const field = screen.getByRole("combobox", { name: "Note" })
    await user.type(field, "Listo")
    await user.keyboard("{Shift>}{Enter}{/Shift}")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.keyboard("{Enter}")
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining("Listo") }))
  })
})
