import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { NotificationInbox, type DeskNotification } from "@/registry/blocks/notification-inbox"
import { SupportInbox } from "@/registry/blocks/support-inbox"
import { TicketDesk, type TicketRecord } from "@/registry/blocks/ticket-desk"

const options = {
  statuses: [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ],
  priorities: [
    { value: "high", label: "High" },
    { value: "low", label: "Low" },
  ],
  types: [{ value: "task", label: "Task" }],
  channels: [{ value: "mail", label: "Mail" }],
  assignees: [{ value: "Mateo", label: "Mateo" }],
}

function ticket(partial: Partial<TicketRecord> & Pick<TicketRecord, "id" | "subject" | "status">): TicketRecord {
  return {
    code: partial.id,
    description: "Descripción",
    requester: "Inés",
    priority: "high",
    type: "task",
    channel: "mail",
    assignee: "Mateo",
    due: "2026-10-01",
    created: "2026-09-01",
    updated: "ayer",
    opened: "Mail",
    tags: [],
    messages: [{ id: "m", author: "Inés", body: partial.subject, time: "ayer", side: "incoming" }],
    ...partial,
  }
}

function notice(partial: Partial<DeskNotification> & Pick<DeskNotification, "id" | "title">): DeskNotification {
  return {
    actor: "Nuria",
    summary: "comentó",
    body: "El horno",
    time: "ayer",
    issueKey: "BRU-1",
    project: "Niebla",
    status: "open",
    priority: "low",
    unread: true,
    starred: false,
    team: false,
    snoozed: false,
    archived: false,
    subscribed: false,
    banner: "Nuria comentó",
    labels: ["horno"],
    comments: [],
    ...partial,
  }
}

describe("desk blocks", () => {
  it("opens a conversation and the new-conversation dialog", async () => {
    const user = userEvent.setup()
    render(
      <SupportInbox
        agentName="Mateo"
        folders={[{ id: "inbox", label: "Inbox", section: "folders", icon: "inbox" }]}
        defaultConversations={[
          {
            id: "c1",
            name: "Inés Soler",
            subject: "Horno",
            preview: "Esmalte",
            time: "10m",
            assignee: "Mateo",
            messages: [{ id: "m", author: "Inés", body: "El esmalte se cuarteó", time: "10m", side: "incoming" }],
          },
        ]}
      />,
    )
    await user.click(screen.getByRole("option", { name: /Inés Soler/ }))
    expect(screen.getByText("El esmalte se cuarteó")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "New conversation" }))
    expect(screen.getByRole("dialog", { name: "New conversation" })).toBeInTheDocument()
  })

  it("filters tickets by status and marks a past due date overdue", async () => {
    const user = userEvent.setup()
    render(
      <TicketDesk
        agentName="Mateo"
        today="2026-10-06"
        defaultTickets={[
          ticket({ id: "open", subject: "Horno abierto", status: "open" }),
          ticket({ id: "shut", subject: "Caja cerrada", status: "closed", due: "2026-10-20" }),
        ]}
        {...options}
      />,
    )
    expect(document.querySelector("[data-overdue='true']")).toHaveTextContent("Overdue")
    await user.click(screen.getByRole("button", { name: "Add filter" }))
    await user.click(screen.getByRole("menuitem", { name: "Status" }))
    await user.click(screen.getByRole("menuitemradio", { name: "Closed" }))
    expect(screen.getByRole("option", { name: /Caja cerrada/ })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /Horno abierto/ })).not.toBeInTheDocument()
  })

  it("marks notices read, archives one, and keeps snooze on the all tab", async () => {
    const user = userEvent.setup()
    render(
      <NotificationInbox
        currentUser={{ id: "mateo", name: "Mateo" }}
        today="2026-10-06"
        statuses={options.statuses}
        priorities={options.priorities}
        defaultNotifications={[
          notice({ id: "n1", title: "Esmalte" }),
          notice({ id: "n2", title: "Caja", unread: false, team: true }),
        ]}
      />,
    )
    const unread = screen.getByRole("tab", { name: /Unread/ })
    expect(unread).toHaveTextContent("1")
    await user.click(screen.getByRole("button", { name: "Mark all read" }))
    expect(unread).toHaveTextContent("0")

    await user.click(screen.getAllByRole("option", { name: /Nuria/ })[0])
    expect(screen.getByRole("heading", { name: "Esmalte" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Snooze" }))
    expect(screen.getByRole("button", { name: "Unsnooze" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("tab", { name: /^All/ }))
    expect(screen.getAllByRole("option", { name: /Nuria/ })).toHaveLength(2)
    await user.click(screen.getByRole("tab", { name: /Unread/ }))
    expect(screen.queryByRole("option", { name: /Nuria/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: /^All/ }))
    const list = screen.getByRole("listbox", { name: "Inbox" })
    await user.click(within(list).getAllByRole("option", { name: /Nuria/ })[0])
    await user.click(screen.getByRole("button", { name: "Archive" }))
    expect(screen.getAllByRole("option", { name: /Nuria/ })).toHaveLength(1)
    expect(screen.queryByRole("heading", { name: "Esmalte" })).not.toBeInTheDocument()
  })
})
