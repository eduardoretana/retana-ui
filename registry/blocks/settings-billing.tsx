"use client"

/**
 * Settings with a billing surface: segmented credits, plan, payment method,
 * a monthly/yearly price switch, and invoices. No payment data leaves the page.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScreenFrame, type AppShellProps, type ShellDensity } from "@/registry/retana/blocks/app-shell"

export type BillingInterval = "monthly" | "yearly"

export type CreditUsage = {
  used: number
  reserved: number
  total: number
  unit?: string
}

export type BillingPlan = {
  id: string
  name: string
  description: string
  monthly: number
  yearly: number
  current?: boolean
  features: string[]
}

export type PaymentMethod = {
  brand: string
  last4: string
  expires: string
  holder: string
}

export type InvoiceStatus = "paid" | "open" | "void"

export type InvoiceRow = {
  id: string
  number: string
  date: string
  amount: string
  status: InvoiceStatus
}

export type MemberRow = {
  id: string
  name: string
  email: string
  role: string
}

export type SettingsBillingClassNames = {
  root?: string
  usage?: string
  plans?: string
  payment?: string
  invoices?: string
}

export type SettingsBillingProps = {
  usage?: CreditUsage
  plans?: BillingPlan[]
  interval?: BillingInterval
  defaultInterval?: BillingInterval
  onIntervalChange?: (interval: BillingInterval) => void
  payment?: PaymentMethod
  invoices?: InvoiceRow[]
  members?: MemberRow[]
  workspaceName?: string
  currency?: string
  locale?: string
  onChangePlan?: (planId: string) => void
  onDownloadInvoice?: (invoiceId: string) => void
  shell?: boolean
  shellProps?: Partial<AppShellProps>
  density?: ShellDensity
  className?: string
  classNames?: SettingsBillingClassNames
  defaultTab?: "general" | "members" | "billing" | "api"
}

export const billingUsage: CreditUsage = { used: 640, reserved: 80, total: 1280, unit: "créditos" }

export const billingPlans: BillingPlan[] = [
  {
    id: "start",
    name: "Inicio",
    description: "Un espacio y tres proyectos.",
    monthly: 0,
    yearly: 0,
    features: ["3 proyectos", "Correo de soporte"],
  },
  {
    id: "team",
    name: "Equipo",
    description: "El plan actual de Acme.",
    monthly: 24,
    yearly: 240,
    current: true,
    features: ["Proyectos sin tope", "Créditos compartidos", "Facturas"],
  },
  {
    id: "studio",
    name: "Estudio",
    description: "Más créditos y un administrador.",
    monthly: 64,
    yearly: 640,
    features: ["Todo lo de Equipo", "Administrador dedicado", "Retención de un año"],
  },
]

export const billingPayment: PaymentMethod = {
  brand: "Tarjeta",
  last4: "4242",
  expires: "08 / 28",
  holder: "Acme Studio",
}

export const billingInvoices: InvoiceRow[] = [
  { id: "in-184", number: "A-184", date: "01 oct 2026", amount: "$24.00", status: "paid" },
  { id: "in-173", number: "A-173", date: "01 sep 2026", amount: "$24.00", status: "paid" },
  { id: "in-162", number: "A-162", date: "01 ago 2026", amount: "$24.00", status: "open" },
]

export const billingMembers: MemberRow[] = [
  { id: "mara", name: "Mara Solís", email: "mara@acme.example", role: "Administradora" },
  { id: "ines", name: "Inés Quesada", email: "ines@acme.example", role: "Edición" },
  { id: "omar", name: "Omar Beltrán", email: "omar@acme.example", role: "Lectura" },
]

const invoiceLabel: Record<InvoiceStatus, string> = {
  paid: "Pagada",
  open: "Abierta",
  void: "Anulada",
}

function money(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value)
}

export function SettingsBilling({
  usage = billingUsage,
  plans = billingPlans,
  interval,
  defaultInterval = "monthly",
  onIntervalChange,
  payment = billingPayment,
  invoices = billingInvoices,
  members = billingMembers,
  workspaceName = "Acme",
  currency = "USD",
  locale = "es-MX",
  onChangePlan,
  onDownloadInvoice,
  shell = true,
  shellProps,
  density = "comfortable",
  className,
  classNames,
  defaultTab = "billing",
}: SettingsBillingProps) {
  const space = density === "compact" ? "p-3" : "p-5"
  const [intervalState, setIntervalState] = React.useState<BillingInterval>(defaultInterval)
  const period = interval ?? intervalState
  const [notice, setNotice] = React.useState("")
  const [alias, setAlias] = React.useState(payment.holder)
  const [editingPay, setEditingPay] = React.useState(false)
  const [invite, setInvite] = React.useState("")
  const [keyVisible, setKeyVisible] = React.useState(false)
  const safeTotal = Math.max(usage.total, 0)
  const used = Math.min(Math.max(usage.used, 0), safeTotal)
  const reserved = Math.min(Math.max(usage.reserved, 0), Math.max(safeTotal - used, 0))
  const free = Math.max(safeTotal - used - reserved, 0)
  const unit = usage.unit ?? "créditos"
  const segments = [
    { id: "used", label: "Usados", value: used, className: "bg-primary" },
    { id: "reserved", label: "Apartados", value: reserved, className: "bg-chart-2" },
    { id: "free", label: "Disponibles", value: free, className: "bg-muted" },
  ]

  function setPeriod(next: BillingInterval) {
    onIntervalChange?.(next)
    if (interval === undefined) setIntervalState(next)
  }

  return (
    <ScreenFrame
      shell={shell}
      shellProps={{ activeId: "settings", contentLabel: "Ajustes", density, ...shellProps }}
      className={className}
    >
      <div data-slot="settings-billing" data-density={density} className={cn("@container flex min-h-0 min-w-0 flex-1 flex-col", space, classNames?.root)}>
        <header className="mb-4">
          <p className="text-xs text-muted-foreground">Ajustes</p>
          <h1 className="text-lg font-semibold tracking-tight">Espacio {workspaceName}</h1>
        </header>
        <Tabs defaultValue={defaultTab} className="min-w-0 gap-4">
          <TabsList aria-label="Secciones de ajustes">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="rounded-xl border border-border p-4">
            <h2 className="text-sm font-medium">General</h2>
            <form
              className="mt-3 grid max-w-md gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                const data = new FormData(event.currentTarget)
                setNotice(`Nombre guardado: ${String(data.get("workspace") ?? "")}`)
              }}
            >
              <label className="grid gap-1 text-sm">
                Nombre del espacio
                <Input name="workspace" defaultValue={workspaceName} />
              </label>
              <label className="grid gap-1 text-sm">
                Zona horaria
                <select
                  name="zone"
                  defaultValue="america-mexico"
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
                >
                  <option value="america-mexico">Ciudad de México</option>
                  <option value="america-bogota">Bogotá</option>
                  <option value="europe-madrid">Madrid</option>
                </select>
              </label>
              <Button type="submit" size="sm" className="w-fit">
                Guardar
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="members" className="rounded-xl border border-border p-4">
            <h2 className="text-sm font-medium">Miembros</h2>
            <form
              className="mt-3 flex flex-wrap items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (!invite.trim()) return
                setNotice(`Invitación preparada para ${invite.trim()}`)
                setInvite("")
              }}
            >
              <label className="grid min-w-0 flex-1 gap-1 text-sm">
                Correo
                <Input type="email" value={invite} placeholder="persona@acme.example" onChange={(event) => setInvite(event.target.value)} />
              </label>
              <Button type="submit" size="sm" disabled={!invite.trim()}>
                Invitar
              </Button>
            </form>
            {members.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Sin miembros.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {members.map((member) => (
                  <li key={member.id} className="flex min-w-0 items-center justify-between gap-2 py-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{member.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{member.email}</span>
                    </span>
                    <Badge variant="outline">{member.role}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="billing" className="flex flex-col gap-4">
            <section aria-label="Uso de créditos" className={cn("rounded-xl border border-border p-4", classNames?.usage)}>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-sm font-medium">Uso</h2>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {used + reserved} de {safeTotal} {unit}
                </p>
              </div>
              <div
                className="mt-3 flex h-3 overflow-hidden rounded-full bg-muted"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={Math.max(safeTotal, 1)}
                aria-valuenow={used}
                aria-label={`${used} ${unit} usados, ${reserved} apartados, ${free} disponibles`}
              >
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className={cn("h-full motion-safe:transition-[width] motion-reduce:transition-none", segment.className)}
                    style={{ width: safeTotal === 0 ? "0%" : `${(segment.value / safeTotal) * 100}%` }}
                  />
                ))}
              </div>
              <ul className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {segments.map((segment) => (
                  <li key={segment.id} className="inline-flex items-center gap-1.5">
                    <span className={cn("size-2 rounded-full", segment.className)} />
                    {segment.label}
                    <span className="tabular-nums text-foreground">{segment.value}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Plan" className={cn(classNames?.plans)}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-medium">Plan</h2>
                <div className="inline-flex rounded-lg border border-border p-0.5" role="group" aria-label="Periodo de precio">
                  {(["monthly", "yearly"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={period === option}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-sm motion-safe:transition-colors motion-reduce:transition-none",
                        period === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                      )}
                      onClick={() => setPeriod(option)}
                    >
                      {option === "monthly" ? "Mensual" : "Anual"}
                    </button>
                  ))}
                </div>
              </div>
              {plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin planes.</p>
              ) : (
                <ul className="grid gap-3 @min-[720px]:grid-cols-3">
                  {plans.map((plan) => {
                    const price = period === "monthly" ? plan.monthly : plan.yearly
                    return (
                      <li key={plan.id} className={cn("flex min-w-0 flex-col rounded-xl border p-3", plan.current ? "border-primary" : "border-border")}>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate font-medium">{plan.name}</h3>
                          {plan.current ? <Badge>Actual</Badge> : null}
                        </div>
                        <p className="mt-1 text-xs break-words text-muted-foreground">{plan.description}</p>
                        <p className="mt-3 text-2xl font-semibold tabular-nums">
                          {money(price, locale, currency)}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            / {period === "monthly" ? "mes" : "año"}
                          </span>
                        </p>
                        <ul className="mt-3 flex flex-1 flex-col gap-1 text-sm">
                          {plan.features.map((feature) => (
                            <li key={feature} className="break-words">
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          type="button"
                          size="sm"
                          className="mt-3"
                          variant={plan.current ? "secondary" : "default"}
                          disabled={plan.current}
                          onClick={() => {
                            onChangePlan?.(plan.id)
                            setNotice(`Plan seleccionado: ${plan.name}`)
                          }}
                        >
                          {plan.current ? "Plan actual" : "Elegir"}
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section aria-label="Método de pago" className={cn("rounded-xl border border-border p-4", classNames?.payment)}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-sm font-medium">Pago</h2>
                  <p className="mt-1 text-sm">
                    {payment.brand} ···· {payment.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {alias} · vence {payment.expires}
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => setEditingPay((open) => !open)}>
                  {editingPay ? "Cerrar" : "Actualizar"}
                </Button>
              </div>
              {editingPay ? (
                <form
                  className="mt-3 grid max-w-sm gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    setEditingPay(false)
                    setNotice("Alias del método actualizado. No se envió un número de tarjeta.")
                  }}
                >
                  <label className="grid gap-1 text-sm">
                    Alias del método
                    <Input value={alias} onChange={(event) => setAlias(event.target.value)} />
                  </label>
                  <p className="text-xs text-muted-foreground">El anfitrión conecta la pasarela. Esta pieza no recoge ni envía un número de tarjeta.</p>
                  <Button type="submit" size="sm" className="w-fit">
                    Guardar alias
                  </Button>
                </form>
              ) : null}
            </section>

            <section aria-label="Facturas" className={cn("rounded-xl border border-border", classNames?.invoices)}>
              <h2 className="px-4 pt-4 text-sm font-medium">Facturas</h2>
              {invoices.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">Sin facturas.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full min-w-[32rem] text-sm">
                    <caption className="sr-only">Facturas del espacio</caption>
                    <thead className="text-left text-xs text-muted-foreground">
                      <tr>
                        <th scope="col" className="px-4 py-2 font-medium">Número</th>
                        <th scope="col" className="px-4 py-2 font-medium">Fecha</th>
                        <th scope="col" className="px-4 py-2 font-medium">Importe</th>
                        <th scope="col" className="px-4 py-2 font-medium">Estado</th>
                        <th scope="col" className="px-4 py-2 font-medium">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-t border-border">
                          <th scope="row" className="px-4 py-2 text-left font-medium">{invoice.number}</th>
                          <td className="px-4 py-2 whitespace-nowrap">{invoice.date}</td>
                          <td className="px-4 py-2 tabular-nums">{invoice.amount}</td>
                          <td className="px-4 py-2">{invoiceLabel[invoice.status]}</td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                onDownloadInvoice?.(invoice.id)
                                setNotice(`Factura ${invoice.number} lista para el anfitrión.`)
                              }}
                            >
                              Descargar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="api" className="rounded-xl border border-border p-4">
            <h2 className="text-sm font-medium">API</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              La clave de ejemplo no es secreta. El anfitrión muestra la suya desde su propio almacén.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm">
                {keyVisible ? "acme_ejemplo_no_usar_0000" : "acme_ejemplo_••••••••"}
              </code>
              <Button type="button" size="sm" variant="outline" aria-pressed={keyVisible} onClick={() => setKeyVisible((visible) => !visible)}>
                {keyVisible ? "Ocultar" : "Mostrar"}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setNotice("Clave de ejemplo copiada al portapapeles solo si el navegador lo permite.")}
              >
                Copiar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        {notice ? (
          <p role="status" className="text-sm text-muted-foreground">
            {notice}
          </p>
        ) : null}
      </div>
    </ScreenFrame>
  )
}
