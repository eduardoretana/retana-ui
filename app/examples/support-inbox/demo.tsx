"use client"

import { SuggestionCard } from "@/registry/ui/suggestion-card"
import { ToolCall } from "@/registry/ui/tool-call"
import { SupportInbox } from "@/registry/blocks/support-inbox"
import {
  brumaAgent,
  brumaAssignees,
  brumaChannels,
  brumaConversations,
  brumaEmojis,
  brumaFolders,
  brumaPriorities,
  brumaSnippets,
  brumaStatuses,
  brumaSuggestions,
  brumaSupportCopy,
  brumaTeams,
} from "@/app/examples/desk/bruma"

export function SupportInboxDemo() {
  return (
    <SupportInbox
      className="h-full"
      folders={brumaFolders}
      defaultConversations={brumaConversations}
      agentName={brumaAgent}
      channels={brumaChannels}
      assignees={brumaAssignees}
      teams={brumaTeams}
      priorities={brumaPriorities}
      statuses={brumaStatuses}
      suggestions={brumaSuggestions}
      snippets={brumaSnippets}
      emojis={brumaEmojis}
      copy={brumaSupportCopy}
      copilot={
        <div className="grid gap-3">
          <SuggestionCard
            title="Tono de la barra"
            suggestion="Manda la placa el jueves y anota si el gris se enfría con la luz del norte."
            variant="action"
            confirmLabel="Usar"
            dismissLabel="Descartar"
          />
          <ToolCall
            call={{
              id: "horno",
              name: "revisar_curva",
              status: "completed",
              input: { horno: 2 },
              output: { tope: 980, esmalte: "Niebla" },
            }}
          />
        </div>
      }
    />
  )
}
