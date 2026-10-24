"use client"

/**
 * Revenue overview built from host tokens. Bars use width and height only,
 * so the same component stays readable on a light or dark theme.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { ScreenFrame, type AppShellProps, type ShellDensity, type ShellNavItem } from "@/registry/retana/blocks/app-shell"

export type AnalyticsKpi = {
  id: string
  label: string
  value: string
  delta: string
  direction?: "up" | "down" | "flat"
}

export type AnalyticsAmount = {
  id: string
  label: string
  amount: number
}

export type AnalyticsShare = {
  id: string
  label: string
  share: number
}

export type AnalyticsProduct = {
  id: string
  name: string
  revenue: string
  units: number
}

export type AnalyticsPoint = {
  id: string
  label: string
  value: number
}

export type AnalyticsClassNames = {
  root?: string
  kpis?: string
  channels?: string
  breakdown?: string
  products?: string
  trends?: string
}

export type AnalyticsOverviewProps = {
  kpis?: AnalyticsKpi[]
  channels?: AnalyticsAmount[]
  breakdown?: AnalyticsShare[]
  products?: AnalyticsProduct[]
  trends?: AnalyticsPoint[]
  locale?: string
  currency?: string
  shell?: boolean
  shellProps?: Partial<AppShellProps>
  density?: ShellDensity
  className?: string
  classNames?: AnalyticsClassNames
  title?: string
}

export const analyticsNav: ShellNavItem[] = [
  { id: "overview", label: "Resumen" },
  { id: "revenue", label: "Ingresos" },
  { id: "products", label: "Productos" },
  { id: "settings", label: "Ajustes" },
]

export const analyticsKpis: AnalyticsKpi[] = [
  { id: "revenue", label: "Ingresos", value: "$186,400", delta: "8% más", direction: "up" },
  { id: "orders", label: "Pedidos", value: "326", delta: "12 menos", direction: "down" },
  { id: "ticket", label: "Ticket", value: "$572", delta: "igual", direction: "flat" },
  { id: "return", label: "Recompra", value: "41%", delta: "3 puntos más", direction: "up" },
]

export const analyticsChannels: AnalyticsAmount[] = [
  { id: "shop", label: "Tienda", amount: 82000 },
  { id: "mail", label: "Correo", amount: 54000 },
  { id: "partners", label: "Socios", amount: 31000 },
  { id: "direct", label: "Directo", amount: 19400 },
]

export const analyticsBreakdown: AnalyticsShare[] = [
  { id: "new", label: "Clientes nuevos", share: 36 },
  { id: "return", label: "Recompra", share: 41 },
  { id: "sample", label: "Muestras", share: 14 },
  { id: "other", label: "Otros", share: 9 },
]

export const analyticsProducts: AnalyticsProduct[] = [
  { id: "lantern", name: "Linterna de campo", revenue: "$64,200", units: 420 },
  { id: "notebook", name: "Cuaderno de obra", revenue: "$28,900", units: 860 },
  { id: "case", name: "Estuche", revenue: "$19,400", units: 310 },
  { id: "lamp", name: "Lámpara de mesa", revenue: "$17,100", units: 96 },
]

export const analyticsTrends: AnalyticsPoint[] = [
  { id: "mon", label: "Lun", value: 18 },
  { id: "tue", label: "Mar", value: 22 },
  { id: "wed", label: "Mié", value: 16 },
  { id: "thu", label: "Jue", value: 28 },
  { id: "fri", label: "Vie", value: 31 },
  { id: "sat", label: "Sáb", value: 14 },
  { id: "sun", label: "Dom", value: 12 },
]

const directionWord: Record<NonNullable<AnalyticsKpi["direction"]>, string> = {
  up: "Sube",
  down: "Baja",
  flat: "Igual",
}

function formatMoney(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value)
}

export function AnalyticsOverview({
  kpis = analyticsKpis,
  channels = analyticsChannels,
  breakdown = analyticsBreakdown,
  products = analyticsProducts,
  trends = analyticsTrends,
  locale = "es-MX",
  currency = "MXN",
  shell = true,
  shellProps,
  density = "comfortable",
  className,
  classNames,
  title = "Esta semana",
}: AnalyticsOverviewProps) {
  const space = density === "compact" ? "gap-3 p-3" : "gap-4 p-4"
  const channelMax = Math.max(...channels.map((item) => item.amount), 0)
  const trendMax = Math.max(...trends.map((item) => item.value), 0)

  return (
    <ScreenFrame
      shell={shell}
      shellProps={{ activeId: "overview", nav: analyticsNav, contentLabel: "Analítica", density, ...shellProps }}
      className={className}
    >
      <div data-slot="analytics" data-density={density} className={cn("@container flex min-h-0 min-w-0 flex-1 flex-col", space, classNames?.root)}>
        <header>
          <p className="text-xs text-muted-foreground">Analítica</p>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </header>
        {kpis.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin indicadores.</p>
        ) : (
          <ul className={cn("grid grid-cols-1 gap-3 @min-[640px]:grid-cols-2 @min-[960px]:grid-cols-4", classNames?.kpis)}>
            {kpis.map((kpi) => (
              <li key={kpi.id} className="min-w-0 rounded-xl border border-border p-3">
                <p className="truncate text-xs text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 truncate text-2xl font-semibold tabular-nums">{kpi.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{directionWord[kpi.direction ?? "flat"]}</span>
                  <span className="ml-1 break-words">{kpi.delta}</span>
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-4 @min-[860px]:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <section aria-label="Ingresos por canal" className={cn("rounded-xl border border-border p-3", classNames?.channels)}>
            <h2 className="text-sm font-medium">Ingresos por canal</h2>
            {channels.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Sin canales.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {channels.map((channel) => {
                  const width = channelMax === 0 ? 0 : (channel.amount / channelMax) * 100
                  return (
                    <li key={channel.id}>
                      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate">{channel.label}</span>
                        <span className="shrink-0 tabular-nums">{formatMoney(channel.amount, locale, currency)}</span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-full bg-muted"
                        role="meter"
                        aria-label={channel.label}
                        aria-valuemin={0}
                        aria-valuemax={Math.max(channelMax, 1)}
                        aria-valuenow={channel.amount}
                      >
                        <div
                          className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-reduce:transition-none"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section aria-label="Desglose" className={cn("rounded-xl border border-border p-3", classNames?.breakdown)}>
            <h2 className="text-sm font-medium">Desglose</h2>
            {breakdown.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Sin desglose.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {breakdown.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate">{item.label}</span>
                    <span className="shrink-0 tabular-nums">{item.share}%</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid gap-4 @min-[860px]:grid-cols-2">
          <section aria-label="Productos destacados" className={cn("rounded-xl border border-border", classNames?.products)}>
            <h2 className="px-3 pt-3 text-sm font-medium">Productos destacados</h2>
            {products.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">Sin productos.</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full min-w-[20rem] text-sm">
                  <caption className="sr-only">Productos con más ingreso</caption>
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">Producto</th>
                      <th scope="col" className="px-3 py-2 font-medium">Ingreso</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Unidades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t border-border">
                        <th scope="row" className="px-3 py-2 text-left font-medium break-words">{product.name}</th>
                        <td className="px-3 py-2 tabular-nums">{product.revenue}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{product.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-label="Tendencia semanal" className={cn("rounded-xl border border-border p-3", classNames?.trends)}>
            <h2 className="text-sm font-medium">Tendencia semanal</h2>
            {trends.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Sin puntos.</p>
            ) : (
              <div className="mt-3 flex h-40 items-end gap-2" role="list">
                {trends.map((point) => {
                  const height = trendMax === 0 ? 0 : (point.value / trendMax) * 100
                  return (
                    <div key={point.id} role="listitem" className="flex min-w-0 flex-1 flex-col items-center gap-1">
                      <div className="relative h-28 w-full" title={`${point.label}: ${point.value}`}>
                        <div
                          className="absolute inset-x-0 bottom-0 rounded-t-md bg-chart-1 motion-safe:transition-[height] motion-reduce:transition-none"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="w-full truncate text-center text-[11px] text-muted-foreground">{point.label}</span>
                      <span className="sr-only">{point.value}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </ScreenFrame>
  )
}
