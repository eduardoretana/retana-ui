"use client"

import { StressCase } from "@/app/examples/stress-case"
import { GuardRuleSimulator } from "@/registry/ui/guard-rule-simulator"

import { clock, filledAction, filledRuleset, mergeAction, mergeRuleset } from "../fixtures"

const token = "Ñ".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Simulador de reglas</h1>
      <StressCase label="Vacío, carga y error">
        <GuardRuleSimulator ruleset={null} action={null} locale="es" />
        <GuardRuleSimulator ruleset={filledRuleset} action={filledAction} status="loading" locale="es" />
        <GuardRuleSimulator ruleset={filledRuleset} action={filledAction} status="error" errorMessage={token} locale="es" />
      </StressCase>
      <StressCase label="320px" width={320}>
        <GuardRuleSimulator
          ruleset={filledRuleset}
          action={{ ...filledAction, text: token }}
          locale="es"
          clock={clock}
        />
      </StressCase>
      <StressCase label="Merge y ruleset largo">
        <GuardRuleSimulator ruleset={mergeRuleset} action={mergeAction} locale="en" clock={clock} />
        <GuardRuleSimulator
          ruleset={{
            ...filledRuleset,
            rules: Array.from({ length: 20 }, (_, index) => ({ ...filledRuleset.rules[0]!, id: `extra-${index}`, name: `Extra ${index}` })),
          }}
          action={filledAction}
          locale="es"
          clock={clock}
        />
      </StressCase>
    </main>
  )
}
