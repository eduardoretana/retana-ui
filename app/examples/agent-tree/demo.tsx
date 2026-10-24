"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { AgentTree, withRetrySibling, withoutAgent, type AgentNode } from "@/registry/ui/agent-tree"

import { bulletinNodes, liveSeed } from "./fixtures"
import { SIM_COST_PER_SECOND, SIM_STEP_MS, addManualAgent, advanceAgentRun } from "./simulate"

function useEditableTree(initial: readonly AgentNode[]) {
  const [nodes, setNodes] = React.useState<AgentNode[]>(() => initial.map((node) => ({ ...node })))
  const serial = React.useRef(initial.length)

  return {
    nodes,
    add: () => {
      serial.current += 1
      setNodes((current) => addManualAgent(current, `enlace-${serial.current}`))
    },
    retry: (id: string) => {
      serial.current += 1
      setNodes((current) => withRetrySibling(current, id, `reintento-${id}-${serial.current}`))
    },
    dismiss: (id: string) => setNodes((current) => withoutAgent(current, id)),
  }
}

function LiveSection() {
  const [nodes, setNodes] = React.useState<AgentNode[]>(() => liveSeed.map((node) => ({ ...node })))
  const [playing, setPlaying] = React.useState(true)
  const serial = React.useRef(liveSeed.length)

  React.useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setNodes((current) => advanceAgentRun(current))
    }, SIM_STEP_MS)
    return () => window.clearInterval(id)
  }, [playing])

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">En vivo</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            El simulador da de alta agentes, cambia estados y sube costo y tiempo. Reintentar deja el fallo
            detenido y abre un hermano en curso.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setPlaying((value) => !value)}>
          {playing ? "Pausar simulación" : "Reanudar simulación"}
        </Button>
      </div>
      <AgentTree
        nodes={nodes}
        tick
        tickIntervalMs={SIM_STEP_MS}
        tickCostPerSecond={SIM_COST_PER_SECOND}
        onAddAgents={() => {
          serial.current += 1
          setNodes((current) => addManualAgent(current, `enlace-${serial.current}`))
        }}
        onRetry={(id) => {
          serial.current += 1
          setNodes((current) => withRetrySibling(current, id, `reintento-${id}-${serial.current}`))
        }}
        onDismiss={(id) => setNodes((current) => withoutAgent(current, id))}
      />
    </section>
  )
}

function ControlledTree({ initial, dark = false }: { initial: readonly AgentNode[]; dark?: boolean }) {
  const tree = useEditableTree(initial)
  const view = <AgentTree nodes={tree.nodes} onAddAgents={tree.add} onRetry={tree.retry} onDismiss={tree.dismiss} />
  if (!dark) return view
  return <div className="dark rounded-xl bg-background text-foreground">{view}</div>
}

export function Demo() {
  return (
    <div className="flex flex-col gap-10">
      <LiveSection />
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Estático</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Siete agentes del boletín, con estados mezclados. El árbol no se mueve solo.
          </p>
        </div>
        <ControlledTree initial={bulletinNodes} />
      </section>
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Oscuro</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Los mismos datos sobre los tokens oscuros del tema.
          </p>
        </div>
        <ControlledTree initial={bulletinNodes} dark />
      </section>
    </div>
  )
}
