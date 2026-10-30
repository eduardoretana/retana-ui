"use client"

import { useId, useMemo, useState } from "react"

import { formatChartNumber, formatChartPercent } from "@/registry/retana/lib/chart-format"
import { flowRoute, layoutFlow, type FlowInputLink, type FlowInputNode } from "@/registry/retana/lib/flow-layout"
import {
  ChartCard,
  ChartKpi,
  ChartLegend,
  ChartTip,
  chartStatusLabels,
  chartStatusLabelsEs,
  dimOpacity,
  usePlotBox,
  type ChartCardClassNames,
  type ChartStatus,
  type ChartStatusLabels,
} from "@/registry/retana/ui/chart-card"
import { SeriesPatterns, seriesPaint } from "@/registry/retana/ui/chart-marks"

export type FlowNode = FlowInputNode
export type FlowLink = FlowInputLink

export type FlowSankeyLabels = ChartStatusLabels & {
  legend: string
  total: string
  node: (label: string, value: string, share: string) => string
}

export const flowSankeyLabels: FlowSankeyLabels = {
  ...chartStatusLabels,
  legend: "Stages",
  total: "Total",
  node: (label, value, share) => `${label}: ${value} (${share})`,
}

export const flowSankeyLabelsEs: FlowSankeyLabels = {
  ...chartStatusLabelsEs,
  legend: "Etapas",
  total: "Total",
  node: (label, value, share) => `${label}: ${value} (${share})`,
}

export type FlowSankeyProps = {
  title: string
  description?: string
  nodes: FlowNode[]
  links: FlowLink[]
  locale?: string
  status?: ChartStatus
  labels?: Partial<FlowSankeyLabels>
  activeId?: string | null
  onActiveChange?: (id: string | null) => void
  onMenu?: () => void
  onRetry?: () => void
  height?: number
  className?: string
  classNames?: ChartCardClassNames
}

export function FlowSankey({
  title,
  description,
  nodes,
  links,
  locale,
  status = "ready",
  labels,
  activeId,
  onActiveChange,
  onMenu,
  onRetry,
  height = 220,
  className,
  classNames,
}: FlowSankeyProps) {
  const copy = { ...flowSankeyLabels, ...labels }
  const pattern = useId().replace(/:/g, "")
  const { node: plotNode, width } = usePlotBox(320, height)
  const [internal, setInternal] = useState<string | null>(null)
  const [tip, setTip] = useState<{ id: string; x: number; y: number } | null>(null)
  const active = activeId !== undefined ? activeId : internal
  const layout = useMemo(() => layoutFlow(nodes, links, Math.max(width, 1), height - 8), [nodes, links, width, height])
  const route = useMemo(() => (active ? flowRoute(active, links) : null), [active, links])
  const firstColumn = nodes.reduce((min, node) => Math.min(min, node.column), Number.POSITIVE_INFINITY)
  const inflow = links.filter((link) => nodes.find((node) => node.id === link.source)?.column === firstColumn)
  const total = (inflow.length > 0 ? inflow : links).reduce((sum, link) => sum + Math.max(0, link.value), 0)
  const empty = nodes.length === 0 || links.every((link) => link.value <= 0)
  const view = status !== "ready" ? status : empty ? "empty" : "ready"
  const tone = new Map(nodes.map((node, index) => [node.id, index]))

  function setActive(id: string | null) {
    if (activeId === undefined) setInternal(id)
    onActiveChange?.(id)
  }

  const hovered = nodes.find((node) => node.id === tip?.id)
  const hoveredValue = layout.nodes.find((node) => node.id === tip?.id)?.value ?? 0

  return (
    <ChartCard
      title={title}
      description={description}
      status={view}
      labels={copy}
      onMenu={onMenu}
      onRetry={onRetry}
      className={className}
      classNames={classNames}
      summary={nodes.map((node) => copy.node(node.label, formatChartNumber(layout.nodes.find((item) => item.id === node.id)?.value ?? 0, locale), formatChartPercent(total ? (layout.nodes.find((item) => item.id === node.id)?.value ?? 0) / total : 0, locale))).join(". ")}
      tableCaption={title}
      columns={[{ id: "value", label: copy.total }]}
      rows={layout.nodes.map((node) => ({ id: node.id, label: node.label, cells: { value: formatChartNumber(node.value, locale) } }))}
      live={hovered ? copy.node(hovered.label, formatChartNumber(hoveredValue, locale), formatChartPercent(total ? hoveredValue / total : 0, locale)) : undefined}
      kpis={<ChartKpi label={copy.total} figure={{ value: total, locale, hierarchy: true, announce: true }} />}
      legend={
        <ChartLegend
          label={copy.legend}
          activeId={active}
          onActiveChange={setActive}
          items={nodes.map((node, index) => ({ id: node.id, label: node.label, tone: index }))}
        />
      }
    >
      <div ref={plotNode} className="relative w-full" style={{ height }}>
        <svg width={width} height={height - 8} className="block overflow-visible" role="group" aria-label={title}>
          <SeriesPatterns id={pattern} />
          {layout.links.map((link) => {
            const on = !route || route.links.has(link.id)
            const index = tone.get(link.source) ?? 0
            return <path key={link.id} data-slot="flow-link" d={link.path} fill={seriesPaint(pattern, index)} opacity={on ? 0.55 : 0.08} />
          })}
          {layout.nodes.map((node) => {
            const on = !route || route.nodes.has(node.id)
            const index = tone.get(node.id) ?? 0
            return (
              <g key={node.id} data-slot="flow-node" opacity={on ? 1 : dimOpacity(false)}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={Math.max(node.height, 2)}
                  rx={3}
                  fill={seriesPaint(pattern, index)}
                  className="outline-none focus-visible:stroke-ring"
                  tabIndex={0}
                  role="button"
                  strokeWidth={2}
                  stroke="transparent"
                  aria-label={copy.node(node.label, formatChartNumber(node.value, locale), formatChartPercent(total ? node.value / total : 0, locale))}
                  aria-pressed={active === node.id}
                  onMouseEnter={(event) => {
                    const rect = plotNode.current?.getBoundingClientRect()
                    setTip({ id: node.id, x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) })
                  }}
                  onMouseLeave={() => setTip(null)}
                  onFocus={(event) => {
                    const rect = plotNode.current?.getBoundingClientRect()
                    const box = event.currentTarget.getBoundingClientRect()
                    setTip({ id: node.id, x: box.left + box.width / 2 - (rect?.left ?? 0), y: box.top - (rect?.top ?? 0) })
                  }}
                  onBlur={() => setTip(null)}
                  onClick={() => setActive(active === node.id ? null : node.id)}
                />
                <text
                  x={node.x > width * 0.62 ? node.x - 6 : node.x + node.width + 6}
                  y={node.y + node.height / 2}
                  textAnchor={node.x > width * 0.62 ? "end" : "start"}
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
        <ChartTip open={hovered != null} x={tip?.x ?? 0} y={tip?.y ?? 0}>
          {hovered ? (
            <span>
              {hovered.label}
              <span className="mt-0.5 block font-medium">
                {formatChartNumber(hoveredValue, locale)} · {formatChartPercent(total ? hoveredValue / total : 0, locale)}
              </span>
            </span>
          ) : null}
        </ChartTip>
      </div>
    </ChartCard>
  )
}
