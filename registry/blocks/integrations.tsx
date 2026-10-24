"use client"

/**
 * Directory of connectable tools. Names and descriptions are fictional so the
 * screen can be installed without borrowing another catalog's listings.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScreenFrame, type AppShellProps, type ShellDensity } from "@/registry/retana/blocks/app-shell"

export type IntegrationCategory = {
  id: string
  label: string
}

export type IntegrationItem = {
  id: string
  name: string
  category: string
  description: string
  connected?: boolean
}

export type IntegrationRequest = {
  name: string
  reason: string
}

export type IntegrationsClassNames = {
  root?: string
  filters?: string
  grid?: string
  request?: string
}

export type IntegrationsProps = {
  categories?: IntegrationCategory[]
  items?: IntegrationItem[]
  query?: string
  defaultQuery?: string
  onQueryChange?: (query: string) => void
  category?: string
  defaultCategory?: string
  onCategoryChange?: (categoryId: string) => void
  onConnect?: (id: string, connected: boolean) => void
  onRequest?: (request: IntegrationRequest) => void
  shell?: boolean
  shellProps?: Partial<AppShellProps>
  density?: ShellDensity
  className?: string
  classNames?: IntegrationsClassNames
}

export const integrationCategories: IntegrationCategory[] = [
  { id: "all", label: "Todas" },
  { id: "comms", label: "Comunicación" },
  { id: "files", label: "Archivos" },
  { id: "data", label: "Datos" },
  { id: "money", label: "Finanzas" },
]

export const integrationItems: IntegrationItem[] = [
  { id: "buzon", name: "Buzón", category: "comms", description: "Avisos y respuestas del equipo.", connected: true },
  { id: "sala", name: "Sala", category: "comms", description: "Notas de una reunión corta." },
  { id: "archivador", name: "Archivador", category: "files", description: "Carpetas compartidas del proyecto." },
  { id: "plano", name: "Plano", category: "files", description: "Versiones de un dibujo." },
  { id: "hoja", name: "Hoja viva", category: "data", description: "Filas que el equipo edita junto." },
  { id: "brujula", name: "Brújula", category: "data", description: "Un tablero de cifras semanales.", connected: true },
  { id: "caja", name: "Caja", category: "money", description: "Cobros y facturas del espacio." },
  { id: "vale", name: "Vale", category: "money", description: "Gastos pequeños de obra." },
]

export function Integrations({
  categories = integrationCategories,
  items = integrationItems,
  query,
  defaultQuery = "",
  onQueryChange,
  category,
  defaultCategory = "all",
  onCategoryChange,
  onConnect,
  onRequest,
  shell = true,
  shellProps,
  density = "comfortable",
  className,
  classNames,
}: IntegrationsProps) {
  const searchId = React.useId()
  const nameId = React.useId()
  const reasonId = React.useId()
  const space = density === "compact" ? "p-3" : "p-5"
  const [queryState, setQueryState] = React.useState(defaultQuery)
  const [categoryState, setCategoryState] = React.useState(defaultCategory)
  const [itemState, setItemState] = React.useState(items)
  const [requestName, setRequestName] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [requestNote, setRequestNote] = React.useState("")
  const needle = (query ?? queryState).trim().toLowerCase()
  const activeCategory = category ?? categoryState
  const source = onConnect ? items : itemState
  const visible = source.filter((item) => {
    const inCategory = activeCategory === "all" || item.category === activeCategory
    const inQuery = !needle || `${item.name} ${item.description}`.toLowerCase().includes(needle)
    return inCategory && inQuery
  })

  function setQuery(next: string) {
    onQueryChange?.(next)
    if (query === undefined) setQueryState(next)
  }

  function setCategory(next: string) {
    onCategoryChange?.(next)
    if (category === undefined) setCategoryState(next)
  }

  function toggle(item: IntegrationItem) {
    const connected = !item.connected
    onConnect?.(item.id, connected)
    if (!onConnect) {
      setItemState((current) => current.map((row) => (row.id === item.id ? { ...row, connected } : row)))
    }
  }

  return (
    <ScreenFrame
      shell={shell}
      shellProps={{ activeId: "settings", contentLabel: "Integraciones", showSearch: false, density, ...shellProps }}
      className={className}
    >
      <div data-slot="integrations" data-density={density} className={cn("@container flex min-h-0 min-w-0 flex-1 flex-col gap-4", space, classNames?.root)}>
        <header>
          <p className="text-xs text-muted-foreground">Directorio</p>
          <h1 className="text-lg font-semibold tracking-tight">Integraciones</h1>
        </header>
        <div className={cn("flex flex-col gap-3", classNames?.filters)}>
          <div className="max-w-md">
            <label htmlFor={searchId} className="sr-only">
              Buscar integraciones
            </label>
            <Input
              id={searchId}
              value={query ?? queryState}
              placeholder="Buscar por nombre"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div role="group" aria-label="Categorías" className="flex flex-wrap gap-1">
            {categories.map((item) => (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={activeCategory === item.id ? "default" : "outline"}
                aria-pressed={activeCategory === item.id}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ninguna herramienta coincide con la búsqueda.</p>
        ) : (
          <ul className={cn("grid gap-3 @min-[640px]:grid-cols-2 @min-[960px]:grid-cols-3", classNames?.grid)}>
            {visible.map((item) => (
              <li key={item.id} className="flex min-w-0 flex-col rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="min-w-0 truncate text-sm font-medium">{item.name}</h2>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{item.connected ? "Conectada" : "Disponible"}</span>
                </div>
                <p className="mt-1 flex-1 text-sm break-words text-muted-foreground">{item.description}</p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3 w-fit"
                  variant={item.connected ? "secondary" : "default"}
                  aria-pressed={Boolean(item.connected)}
                  onClick={() => toggle(item)}
                >
                  {item.connected ? "Conectada" : "Conectar"}
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form
          aria-label="Pedir una integración"
          className={cn("rounded-xl border border-border p-4", classNames?.request)}
          onSubmit={(event) => {
            event.preventDefault()
            if (!requestName.trim()) return
            const payload = { name: requestName.trim(), reason: reason.trim() }
            onRequest?.(payload)
            setRequestNote(`Pedido anotado: ${payload.name}.`)
            setRequestName("")
            setReason("")
          }}
        >
          <h2 className="text-sm font-medium">Pedir una integración</h2>
          <p className="mt-1 text-sm text-muted-foreground">El pedido se queda en esta pantalla. No se envía a ningún servicio.</p>
          <div className="mt-3 grid gap-3 @min-[640px]:grid-cols-2">
            <label htmlFor={nameId} className="grid gap-1 text-sm">
              Herramienta
              <Input id={nameId} value={requestName} onChange={(event) => setRequestName(event.target.value)} />
            </label>
            <label htmlFor={reasonId} className="grid gap-1 text-sm">
              Para qué la necesitas
              <Textarea id={reasonId} value={reason} className="min-h-16" onChange={(event) => setReason(event.target.value)} />
            </label>
          </div>
          <Button type="submit" size="sm" className="mt-3" disabled={!requestName.trim()}>
            Pedir
          </Button>
          {requestNote ? (
            <p role="status" className="mt-2 text-sm">
              {requestNote}
            </p>
          ) : null}
        </form>
      </div>
    </ScreenFrame>
  )
}
