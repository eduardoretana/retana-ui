"use client"

import { TicketDesk } from "@/registry/blocks/ticket-desk"
import {
  brumaAgent,
  brumaAssignees,
  brumaChannels,
  brumaEmojis,
  brumaPriorities,
  brumaSnippets,
  brumaStatuses,
  brumaSuggestions,
  brumaTicketCopy,
  brumaTickets,
  brumaTypes,
} from "@/app/examples/desk/bruma"

export function TicketDeskDemo() {
  return (
    <TicketDesk
      className="h-full"
      defaultTickets={brumaTickets}
      agentName={brumaAgent}
      today="2026-10-06"
      locale="es-MX"
      statuses={brumaStatuses}
      priorities={brumaPriorities}
      types={brumaTypes}
      channels={brumaChannels}
      assignees={brumaAssignees}
      suggestions={brumaSuggestions}
      snippets={brumaSnippets}
      emojis={brumaEmojis}
      copy={brumaTicketCopy}
    />
  )
}
