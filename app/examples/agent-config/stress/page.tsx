"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AgentConfig } from "@/registry/ui/agent-config"

import { filled, guardrailTypes, manyAgents, models, versionsFor } from "../fixtures"

const token = "N".repeat(60)
const es = filled.es

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Configuración de agentes</h1>
      <StressCase label="Vacío, carga y error">
        <AgentConfig locale="es" workspace={es.workspace} agents={[]} versions={[]} models={models} guardrailTypes={guardrailTypes} />
        <AgentConfig locale="es" workspace={es.workspace} agents={es.agents} versions={es.versions} models={models} guardrailTypes={guardrailTypes} loading />
        <AgentConfig locale="es" workspace={es.workspace} agents={[]} versions={[]} models={models} guardrailTypes={guardrailTypes} error="No se pudo abrir Nimbo." />
      </StressCase>
      <StressCase label="Cuarenta agentes y un nombre de 60 caracteres" width={360}>
        <AgentConfig
          locale="es"
          workspace={{ ...es.workspace, title: token }}
          agents={manyAgents("es")}
          versions={versionsFor("es")}
          models={models}
          guardrailTypes={guardrailTypes}
        />
      </StressCase>
      <StressCase label="Bandas extremas y distribución vacía" width={390}>
        <AgentConfig
          locale="es"
          workspace={es.workspace}
          agents={es.agents.slice(0, 1)}
          versions={es.versions}
          models={models}
          guardrailTypes={guardrailTypes}
          draft={{
            ...es.versions.find((version) => version.id === "leads-v7")!,
            id: "leads-v7:draft",
            state: "draft",
            bands: { reject: { min: 0, max: 5 }, review: { min: 5, max: 10 }, auto: { min: 10, max: 100 } },
            evaluation: { periodDays: 30, distribution: [], accuracy: 0 },
          }}
        />
      </StressCase>
      <StressCase label="RTL" width={390}>
        <div dir="rtl">
          <AgentConfig locale="en" workspace={filled.en.workspace} agents={filled.en.agents.slice(0, 2)} versions={filled.en.versions} models={models} guardrailTypes={guardrailTypes} />
        </div>
      </StressCase>
      <StressCase label="Solo lectura">
        <AgentConfig locale="es" workspace={es.workspace} agents={es.agents} versions={es.versions} models={models} guardrailTypes={guardrailTypes} readOnly />
      </StressCase>
    </main>
  )
}
