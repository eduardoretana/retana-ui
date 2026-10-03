import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { htmlToMarkdown, markdownToHtml, RichTextEditor } from "@/registry/ui/rich-text-editor"

describe("RichTextEditor", () => {
  it("converts markdown shortcuts to HTML and back", () => {
    const html = markdownToHtml("# Kiln log\n\nA **stoneware** line and `cone 6`.\n\n- bisque\n- glaze\n\n> slow cool\n\n---")
    expect(html).toContain("<h1>Kiln log</h1>")
    expect(html).toContain("<strong>stoneware</strong>")
    expect(html).toContain("<code>cone 6</code>")
    expect(html).toContain("<ul><li>bisque</li><li>glaze</li></ul>")
    expect(html).toContain("<blockquote>")
    expect(html).toContain("<hr>")
    const markdown = htmlToMarkdown(html)
    expect(markdown).toContain("# Kiln log")
    expect(markdown).toContain("**stoneware**")
    expect(markdown).toContain("`cone 6`")
    expect(markdown).toContain("- bisque")
  })

  it("renders markdown and reports HTML plus markdown", () => {
    const onChange = vi.fn()
    render(<RichTextEditor aria-label="Note" defaultMarkdown={"# Kiln\n\nA **stoneware** bowl."} onChange={onChange} />)
    const editor = screen.getByRole("textbox", { name: "Note" })
    expect(editor.querySelector("h1")).toHaveTextContent("Kiln")
    expect(editor.querySelector("strong")).toHaveTextContent("stoneware")
    const last = onChange.mock.calls.at(-1)?.[0]
    expect(last.html).toContain("<h1>Kiln</h1>")
    expect(last.markdown).toContain("# Kiln")
    expect(last.markdown).toContain("**stoneware**")
    expect(last.empty).toBe(false)
  })

  it("opens the slash menu from a typed slash and inserts a quote", async () => {
    const user = userEvent.setup()
    render(<RichTextEditor aria-label="Note" />)
    const editor = screen.getByRole("textbox", { name: "Note" })
    editor.focus()
    const paragraph = editor.querySelector("p")!
    paragraph.textContent = "/"
    const text = paragraph.firstChild!
    const range = document.createRange()
    range.setStart(text, 1)
    range.collapse(true)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "/" }))
    const list = await screen.findByRole("listbox", { name: "Blocks" })
    expect(list).toBeInTheDocument()
    await user.click(screen.getByRole("option", { name: /Quote/ }))
    expect(editor.querySelector("blockquote")).toBeInTheDocument()
  })

  it("bolds a selection from the floating toolbar", async () => {
    const user = userEvent.setup()
    render(<RichTextEditor aria-label="Note" defaultMarkdown="stoneware" />)
    const editor = screen.getByRole("textbox", { name: "Note" })
    const text = editor.querySelector("p")!
    const range = document.createRange()
    range.selectNodeContents(text)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    document.dispatchEvent(new Event("selectionchange"))
    const bold = await screen.findByRole("button", { name: "Bold" })
    await user.click(bold)
    expect(editor.querySelector("strong, b")?.textContent).toBe("stoneware")
  })
})
