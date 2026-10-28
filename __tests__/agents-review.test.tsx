import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { bodyFor, filled as emailFilled } from "@/app/examples/email-draft/fixtures"
import { filled as diffFilled } from "@/app/examples/inline-diff/fixtures"
import { filled as messageFilled } from "@/app/examples/message-actions/fixtures"
import { filled as reviewFilled, itemsFrom } from "@/app/examples/review-center/fixtures"
import { diffText, diffWords, InlineDiff } from "@/registry/ui/inline-diff"
import { messageCount, MessageActions } from "@/registry/ui/message-actions"
import { PermissionRequest, permissionScopes } from "@/registry/ui/permission-request"
import { ReviewCenter, reviewQueue } from "@/registry/ui/review-center"

describe("review center", () => {
  it("sorts by risk and approves the Celaya mail", async () => {
    const user = userEvent.setup()
    const onDecide = vi.fn()
    const items = itemsFrom(reviewFilled, "en")
    expect(reviewQueue(items).map((item) => item.id)).toEqual(["celaya", "entrega", "cobalto"])
    expect(reviewQueue(items, "unsure").map((item) => item.id)).toEqual(["celaya"])
    render(<ReviewCenter items={items} selectedId="celaya" onDecide={onDecide} />)
    expect(screen.getByText("Check that it did not slip back to $16,200.00.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Approve" }))
    expect(onDecide).toHaveBeenCalledWith("celaya", { decision: "approve" })
  })
})

describe("permission request", () => {
  it("hides always on a destructive ask", async () => {
    const user = userEvent.setup()
    const onDecisionChange = vi.fn()
    expect(permissionScopes("destructive")).toEqual(["once", "timed"])
    render(<PermissionRequest agent={{ name: "Caja" }} action="delete the old deposit" risk="destructive" onDecisionChange={onDecisionChange} />)
    expect(screen.queryByRole("radio", { name: "Always" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Allow once" }))
    expect(onDecisionChange).toHaveBeenCalledWith({ allow: true, scope: "once" })
  })
})

describe("inline diff", () => {
  it("keeps the original until a change is accepted", async () => {
    const user = userEvent.setup()
    const onDecide = vi.fn()
    const pair = diffFilled.es
    const segments = diffWords(pair.original, pair.suggested)
    const changes = segments.filter((segment) => segment.type === "change")
    expect(changes.some((segment) => segment.type === "change" && segment.remove.includes("cobalto"))).toBe(true)
    expect(changes.some((segment) => segment.type === "change" && segment.insert.includes("lunes"))).toBe(true)
    expect(diffText(segments, {})).toBe(pair.original)
    const accepted = Object.fromEntries(changes.map((segment) => [segment.id, "accept" as const]))
    expect(diffText(segments, accepted)).toBe(pair.suggested)
    render(<InlineDiff changes={segments} onDecide={onDecide} />)
    await user.click(screen.getByRole("button", { name: /^Accept$/ }))
    expect(onDecide).toHaveBeenCalledWith(changes[0]?.id, "accept")
  })
})

describe("email draft", () => {
  it("switches the short tone for Ramón", () => {
    expect(bodyFor(emailFilled, "es", "breve", "ramon")).toContain("PED-990")
    expect(bodyFor(emailFilled, "en", "claro", "mariana")).toContain("Monday 2 November")
  })
})

describe("message actions", () => {
  it("copies the answer and opens the reason row", async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    const onFeedback = vi.fn()
    const versions = messageFilled.versions.map((version) => version.en)
    expect(messageCount(versions)).toBe(2)
    render(<MessageActions versions={versions} version={0} onCopy={onCopy} onFeedback={onFeedback} />)
    expect(screen.getByText("Version 1 of 2")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(onCopy).toHaveBeenCalledWith(versions[0])
    await user.click(screen.getByRole("button", { name: "Poor answer" }))
    expect(onFeedback).toHaveBeenCalledWith("down")
  })
})
