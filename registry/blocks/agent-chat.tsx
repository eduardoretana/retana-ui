"use client"

/**
 * Three-pane agent conversation. Status words travel with the color so the
 * working state stays clear when motion is reduced.
 */

import * as React from "react"
import { Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScreenFrame, type AppShellProps, type ShellDensity } from "@/registry/retana/blocks/app-shell"

export type AgentChatRole = "user" | "orchestrator" | "agent"

export type AgentChatMessage = {
  id: string
  role: AgentChatRole
  author: string
  body: string
  time?: string
}

export type WorkingAgentStatus = "queued" | "working" | "done"

export type WorkingAgent = {
  id: string
  name: string
  task: string
  status: WorkingAgentStatus
}

export type BriefSwatch = "primary" | "accent" | "muted" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"

export type BriefPalette = {
  id: string
  label: string
  swatch: BriefSwatch
}

export type AgentBrief = {
  product: string
  angle: string
  audience: string
  channels: string[]
  palette: BriefPalette[]
  cta: string
}

export type AgentChatClassNames = {
  root?: string
  thread?: string
  agents?: string
  brief?: string
  composer?: string
}

export type AgentChatProps = {
  title?: string
  messages?: AgentChatMessage[]
  agents?: WorkingAgent[]
  brief?: AgentBrief
  reply?: string
  defaultReply?: string
  onReplyChange?: (value: string) => void
  onSend?: (text: string) => void
  pending?: boolean
  shell?: boolean
  shellProps?: Partial<AppShellProps>
  density?: ShellDensity
  className?: string
  classNames?: AgentChatClassNames
}

const swatchClass: Record<BriefSwatch, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  muted: "bg-muted",
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
}

const statusLabel: Record<WorkingAgentStatus, string> = {
  queued: "En espera",
  working: "Trabajando",
  done: "Listo",
}

const statusClass: Record<WorkingAgentStatus, string> = {
  queued: "bg-muted text-muted-foreground",
  working: "bg-accent text-accent-foreground",
  done: "bg-primary/10 text-primary",
}

export const agentChatMessages: AgentChatMessage[] = [
  {
    id: "m1",
    role: "user",
    author: "Mara Solís",
    time: "09:14",
    body: "Necesito un encargo para presentar la linterna de campo al equipo de obra.",
  },
  {
    id: "m2",
    role: "orchestrator",
    author: "Orquestador",
    time: "09:14",
    body: "Armo el encargo en tres partes: contexto del producto, ángulo y una llamada a la acción. Investigación y redacción trabajan en paralelo.",
  },
  {
    id: "m3",
    role: "agent",
    author: "Investigación",
    time: "09:15",
    body: "El público pide menos ruido y un alcance corto. El canal más usado esta semana fue el correo del lunes.",
  },
]

export const agentChatAgents: WorkingAgent[] = [
  { id: "research", name: "Investigación", task: "Audiencia y canales", status: "done" },
  { id: "writer", name: "Redacción", task: "Borrador del encargo", status: "working" },
  { id: "review", name: "Revisión", task: "Tono y cifras", status: "queued" },
]

export const agentChatBrief: AgentBrief = {
  product: "Linterna de campo",
  angle: "Menos ruido, más alcance",
  audience: "Cuadrillas pequeñas de obra",
  channels: ["Correo", "Sitio", "Ficha impresa"],
  palette: [
    { id: "ink", label: "Tinta", swatch: "primary" },
    { id: "paper", label: "Papel", swatch: "muted" },
    { id: "signal", label: "Señal", swatch: "chart-2" },
  ],
  cta: "Pedir una muestra",
}

const roleLabel: Record<AgentChatRole, string> = {
  user: "Tú",
  orchestrator: "Coordinación",
  agent: "Agente",
}

export function AgentChat({
  title = "Encargo de la linterna",
  messages = agentChatMessages,
  agents = agentChatAgents,
  brief = agentChatBrief,
  reply,
  defaultReply = "",
  onReplyChange,
  onSend,
  pending = false,
  shell = true,
  shellProps,
  density = "comfortable",
  className,
  classNames,
}: AgentChatProps) {
  const replyId = React.useId()
  const [replyState, setReplyState] = React.useState(defaultReply)
  const draft = reply ?? replyState
  const space = density === "compact" ? "p-3" : "p-4"

  function setDraft(next: string) {
    onReplyChange?.(next)
    if (reply === undefined) setReplyState(next)
  }

  return (
    <ScreenFrame
      shell={shell}
      shellProps={{ activeId: "assistant", contentLabel: "Conversación", density, ...shellProps }}
      className={className}
    >
      <div data-slot="agent-chat" data-density={density} className={cn("@container flex min-h-0 min-w-0 flex-1 flex-col", classNames?.root)}>
        <header className={cn("flex items-center justify-between gap-3 border-b border-border", space)}>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Conversación</p>
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          </div>
          <Badge variant="secondary">{agents.filter((agent) => agent.status === "working").length} en curso</Badge>
        </header>
        <div className="flex min-h-0 flex-1 flex-col @min-[880px]:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className={cn("min-h-0 flex-1 space-y-4 overflow-auto", space, classNames?.thread)}>
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">La conversación está vacía.</p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {messages.map((message) => (
                    <li
                      key={message.id}
                      className={cn(
                        "max-w-2xl rounded-xl border border-border px-3 py-2",
                        message.role === "user" && "ml-auto bg-muted",
                        message.role === "orchestrator" && "bg-card",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="min-w-0 truncate text-xs font-medium">
                          <span className="text-muted-foreground">{roleLabel[message.role]} · </span>
                          {message.author}
                        </p>
                        {message.time ? <time className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{message.time}</time> : null}
                      </div>
                      <p className="mt-1 text-sm break-words">{message.body}</p>
                    </li>
                  ))}
                </ol>
              )}
              <section aria-label="Agentes en curso" className={cn("rounded-xl border border-border p-3", classNames?.agents)}>
                <h2 className="text-sm font-medium">Agentes en curso</h2>
                {agents.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">Nadie está trabajando.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {agents.map((agent) => (
                      <li key={agent.id} className="flex min-w-0 items-center justify-between gap-2">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{agent.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{agent.task}</span>
                        </span>
                        <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", statusClass[agent.status])}>
                          {agent.status === "working" ? (
                            <span className="size-1.5 rounded-full bg-current motion-safe:animate-pulse motion-reduce:animate-none" aria-hidden />
                          ) : null}
                          {statusLabel[agent.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
            <form
              className={cn("border-t border-border", space, classNames?.composer)}
              onSubmit={(event) => {
                event.preventDefault()
                if (pending || !draft.trim()) return
                onSend?.(draft.trim())
                if (reply === undefined) setReplyState("")
              }}
            >
              <label htmlFor={replyId} className="sr-only">
                Respuesta
              </label>
              <div className="flex items-end gap-2">
                <Textarea
                  id={replyId}
                  value={draft}
                  disabled={pending}
                  placeholder="Escribe una indicación"
                  className="min-h-16 flex-1"
                  onChange={(event) => setDraft(event.target.value)}
                />
                <Button type="submit" disabled={pending || !draft.trim()} aria-label="Enviar respuesta">
                  <Send />
                </Button>
              </div>
            </form>
          </div>
          <aside aria-label="Encargo" className={cn("min-w-0 border-t border-border @min-[880px]:w-80 @min-[880px]:border-t-0 @min-[880px]:border-s", space, classNames?.brief)}>
            <h2 className="text-sm font-medium">Encargo</h2>
            <dl className="mt-3 flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Producto</dt>
                <dd className="break-words font-medium">{brief.product || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Ángulo</dt>
                <dd className="break-words">{brief.angle || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Audiencia</dt>
                <dd className="break-words">{brief.audience || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Canales</dt>
                <dd>
                  {brief.channels.length === 0 ? (
                    "—"
                  ) : (
                    <ul className="mt-1 flex flex-wrap gap-1">
                      {brief.channels.map((channel) => (
                        <li key={channel}>
                          <Badge variant="outline">{channel}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Paleta</dt>
                <dd>
                  {brief.palette.length === 0 ? (
                    "—"
                  ) : (
                    <ul className="mt-1 flex flex-col gap-1">
                      {brief.palette.map((swatch) => (
                        <li key={swatch.id} className="flex min-w-0 items-center gap-2">
                          <span className={cn("size-3 shrink-0 rounded-sm border border-border", swatchClass[swatch.swatch])} />
                          <span className="truncate">{swatch.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Llamada a la acción</dt>
                <dd className="break-words font-medium">{brief.cta || "—"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </ScreenFrame>
  )
}
