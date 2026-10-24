"use client"

/**
 * Home canvas for an assistant. The arrangement follows a public product
 * preview only; the greeting, tools, and sample apps are original.
 */

import * as React from "react"
import { Mic, Plug, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScreenFrame, type AppShellProps, type ShellDensity } from "@/registry/retana/blocks/app-shell"

export type AssistantModel = {
  id: string
  label: string
}

export type AssistantPlugin = {
  id: string
  label: string
  enabled?: boolean
}

export type AssistantApp = {
  id: string
  name: string
  detail?: string
  connected?: boolean
}

export type AssistantAction = {
  id: string
  label: string
  prompt: string
}

export type AssistantSubmit = {
  text: string
  modelId: string
  pluginIds: string[]
  listening: boolean
}

export type AssistantHomeClassNames = {
  root?: string
  greeting?: string
  composer?: string
  apps?: string
  actions?: string
}

export type AssistantHomeProps = {
  greeting?: string
  name?: string
  hint?: string
  models?: AssistantModel[]
  modelId?: string
  defaultModelId?: string
  onModelChange?: (id: string) => void
  plugins?: AssistantPlugin[]
  onPluginsChange?: (ids: string[]) => void
  apps?: AssistantApp[]
  onAppConnect?: (id: string, connected: boolean) => void
  actions?: AssistantAction[]
  placeholder?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit?: (payload: AssistantSubmit) => void
  pending?: boolean
  listening?: boolean
  onListeningChange?: (listening: boolean) => void
  shell?: boolean
  shellProps?: Partial<AppShellProps>
  density?: ShellDensity
  className?: string
  classNames?: AssistantHomeClassNames
  connectLabel?: string
  pluginsLabel?: string
  modelLabel?: string
  micLabel?: string
  sendLabel?: string
}

export const assistantModels: AssistantModel[] = [
  { id: "bruma", label: "Bruma" },
  { id: "norte", label: "Norte" },
  { id: "costa", label: "Costa" },
]

export const assistantPlugins: AssistantPlugin[] = [
  { id: "files", label: "Archivos", enabled: true },
  { id: "calendar", label: "Agenda", enabled: false },
  { id: "notes", label: "Notas", enabled: true },
]

export const assistantApps: AssistantApp[] = [
  { id: "mail", name: "Correo", detail: "Bandeja del equipo", connected: true },
  { id: "calendar", name: "Calendario", detail: "Semana compartida" },
  { id: "docs", name: "Documentos", detail: "Carpeta Faro" },
  { id: "board", name: "Tablero", detail: "Obra en curso" },
]

export const assistantActions: AssistantAction[] = [
  { id: "week", label: "Resumir la semana", prompt: "Resume la semana del equipo Faro en cinco puntos." },
  { id: "proposal", label: "Preparar una propuesta", prompt: "Prepara una propuesta breve para el taller Lumen." },
  { id: "metrics", label: "Revisar métricas", prompt: "Revisa los ingresos de la última semana y señala una anomalía." },
  { id: "mail", label: "Escribir un correo", prompt: "Escribe un correo corto para pedir una muestra de la linterna de campo." },
]

const pad = {
  comfortable: "px-6 py-10",
  compact: "px-3 py-6",
} as const

export function AssistantHome({
  greeting = "Buenas tardes",
  name = "Mara",
  hint = "Puedo armar un plan, un borrador o una revisión con las herramientas que conectes.",
  models = assistantModels,
  modelId,
  defaultModelId = assistantModels[0]?.id ?? "",
  onModelChange,
  plugins = assistantPlugins,
  onPluginsChange,
  apps = assistantApps,
  onAppConnect,
  actions = assistantActions,
  placeholder = "Pide un plan, un borrador o una revisión",
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  pending = false,
  listening: listeningProp,
  onListeningChange,
  shell = true,
  shellProps,
  density = "comfortable",
  className,
  classNames,
  connectLabel = "Conectar aplicaciones",
  pluginsLabel = "Complementos",
  modelLabel = "Modelo",
  micLabel = "Micrófono",
  sendLabel = "Enviar",
}: AssistantHomeProps) {
  const promptId = React.useId()
  const modelSelectId = React.useId()
  const pluginPanelId = React.useId()
  const [textState, setTextState] = React.useState(defaultValue)
  const text = value ?? textState
  const [modelState, setModelState] = React.useState(defaultModelId)
  const selectedModel = modelId ?? modelState
  const [enabled, setEnabled] = React.useState(() => new Set(plugins.filter((plugin) => plugin.enabled).map((plugin) => plugin.id)))
  const [pluginsOpen, setPluginsOpen] = React.useState(false)
  const [listeningState, setListeningState] = React.useState(false)
  const listening = listeningProp ?? listeningState
  const [appsState, setAppsState] = React.useState(apps)
  const visibleApps = onAppConnect ? apps : appsState

  function setText(next: string) {
    onValueChange?.(next)
    if (value === undefined) setTextState(next)
  }

  function setModel(next: string) {
    onModelChange?.(next)
    if (modelId === undefined) setModelState(next)
  }

  function togglePlugin(id: string) {
    const next = new Set(enabled)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setEnabled(next)
    onPluginsChange?.([...next])
  }

  function toggleApp(app: AssistantApp) {
    const connected = !app.connected
    onAppConnect?.(app.id, connected)
    if (!onAppConnect) {
      setAppsState((current) => current.map((item) => (item.id === app.id ? { ...item, connected } : item)))
    }
  }

  function setListening(next: boolean) {
    onListeningChange?.(next)
    if (listeningProp === undefined) setListeningState(next)
  }

  return (
    <ScreenFrame
      shell={shell}
      shellProps={{ activeId: "assistant", density, ...shellProps }}
      className={className}
    >
      <div
        data-slot="assistant-home"
        data-density={density}
        className={cn("@container mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col justify-center", pad[density], classNames?.root)}
      >
        <header className={cn("mb-6", classNames?.greeting)}>
          <h1 className="text-balance text-3xl font-semibold tracking-tight">
            {greeting}
            {name ? <span className="text-muted-foreground">, {name}</span> : null}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{hint}</p>
        </header>

        <form
          className={cn("rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-sm", classNames?.composer)}
          onSubmit={(event) => {
            event.preventDefault()
            if (pending || !text.trim()) return
            onSubmit?.({
              text: text.trim(),
              modelId: selectedModel,
              pluginIds: [...enabled],
              listening,
            })
          }}
        >
          <label htmlFor={promptId} className="sr-only">
            Mensaje para el asistente
          </label>
          <Textarea
            id={promptId}
            value={text}
            placeholder={placeholder}
            disabled={pending}
            className="min-h-24 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            onChange={(event) => setText(event.target.value)}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-expanded={pluginsOpen}
                  aria-controls={pluginPanelId}
                  onClick={() => setPluginsOpen((open) => !open)}
                >
                  <Plug />
                  {pluginsLabel}
                </Button>
                {pluginsOpen ? (
                  <ul
                    id={pluginPanelId}
                    className="absolute bottom-full z-10 mb-1 w-52 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
                  >
                    {plugins.length === 0 ? (
                      <li className="px-2 py-1.5 text-xs text-muted-foreground">Sin complementos</li>
                    ) : (
                      plugins.map((plugin) => (
                        <li key={plugin.id}>
                          <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                            <input
                              type="checkbox"
                              checked={enabled.has(plugin.id)}
                              onChange={() => togglePlugin(plugin.id)}
                            />
                            <span className="min-w-0 truncate">{plugin.label}</span>
                          </label>
                        </li>
                      ))
                    )}
                  </ul>
                ) : null}
              </div>
              <div className="min-w-0">
                <label htmlFor={modelSelectId} className="sr-only">
                  {modelLabel}
                </label>
                <select
                  id={modelSelectId}
                  value={selectedModel}
                  aria-label={modelLabel}
                  disabled={pending || models.length === 0}
                  className="h-7 max-w-40 rounded-lg border border-border bg-background px-2 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  onChange={(event) => setModel(event.target.value)}
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={listening ? "secondary" : "outline"}
                size="icon-sm"
                aria-pressed={listening}
                aria-label={listening ? `${micLabel}, activo` : micLabel}
                disabled={pending}
                onClick={() => setListening(!listening)}
              >
                <Mic className={cn(listening && "motion-safe:animate-pulse motion-reduce:animate-none")} />
              </Button>
              <Button type="submit" size="sm" disabled={pending || !text.trim()}>
                <Send />
                {pending ? "Enviando" : sendLabel}
              </Button>
            </div>
          </div>
        </form>

        <section aria-label={connectLabel} className={cn("mt-6", classNames?.apps)}>
          <h2 className="text-sm font-medium">{connectLabel}</h2>
          {visibleApps.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No hay aplicaciones para conectar.</p>
          ) : (
            <ul className="mt-2 grid grid-cols-1 gap-2 @min-[520px]:grid-cols-2">
              {visibleApps.map((app) => (
                <li key={app.id} aria-label={app.name} className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{app.name}</span>
                    {app.detail ? <span className="block truncate text-xs text-muted-foreground">{app.detail}</span> : null}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant={app.connected ? "secondary" : "outline"}
                    aria-pressed={Boolean(app.connected)}
                    onClick={() => toggleApp(app)}
                  >
                    {app.connected ? "Conectada" : "Conectar"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Acciones" className={cn("mt-5", classNames?.actions)}>
          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin acciones sugeridas.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <li key={action.id}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="max-w-full"
                    onClick={() => setText(action.prompt)}
                  >
                    <span className="truncate">{action.label}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ScreenFrame>
  )
}
