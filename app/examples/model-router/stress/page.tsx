"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ModelRouter } from "@/registry/ui/model-router"
import type { RouterPolicy } from "@/registry/lib/model-router"

import { environments, filledPolicy, routerLabels } from "../fixtures"

const token = "N".repeat(60)

function many(): RouterPolicy {
  const routes = Array.from({ length: 30 }, (_, index) => ({
    id: `m${index}`,
    name: index === 3 ? token : `Modelo demo ${index + 1}`,
    vendor: index === 4 ? token : "Taller demo",
    share: index === 0 ? 100 : 0,
    metrics:
      index === 7
        ? undefined
        : {
            p95Ms: 200 + index * 40,
            p99Ms: 800 + index * 50,
            amountPer1k: 0.05 + index * 0.03,
            errorRate: index === 0 ? 0 : 0.2,
          },
  }))
  return {
    ...filledPolicy,
    name: token,
    routes,
    fallback: { enabled: true, modelIds: ["m0", "m0", "ausente"] },
  }
}

const extreme: RouterPolicy = {
  ...filledPolicy,
  routes: filledPolicy.routes.map((route, index) => ({ ...route, share: index === 0 ? 100 : 0 })),
}

export default function StressPage() {
  const shared = {
    environments: [...environments],
    onPolicyChange: () => {},
    onDeployRequest: async () => {},
    locale: "es-MX",
    currency: "MXN",
    labels: routerLabels("es"),
  }
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold text-balance">Estrés · Enrutador de modelos</h1>
      <StressCase label="Vacío, carga y error">
        <ModelRouter {...shared} policy={{ ...filledPolicy, routes: [] }} deployed={{ ...filledPolicy, routes: [] }} />
        <ModelRouter {...shared} policy={filledPolicy} deployed={filledPolicy} status="loading" />
        <ModelRouter {...shared} policy={filledPolicy} deployed={filledPolicy} status="error" error="La red no respondió." />
      </StressCase>
      <StressCase label="390 px, partes 0 y 100" width={390}>
        <ModelRouter {...shared} policy={extreme} deployed={filledPolicy} />
      </StressCase>
      <StressCase label="30 modelos y un nombre de 60 caracteres" width={390}>
        <ModelRouter {...shared} policy={many()} deployed={many()} />
      </StressCase>
      <StressCase label="Solo teclado y solo lectura" width={390}>
        <ModelRouter {...shared} policy={filledPolicy} deployed={filledPolicy} readOnly />
      </StressCase>
      <StressCase label="RTL" width={390}>
        <div dir="rtl">
          <ModelRouter {...shared} policy={filledPolicy} deployed={filledPolicy} />
        </div>
      </StressCase>
    </main>
  )
}
