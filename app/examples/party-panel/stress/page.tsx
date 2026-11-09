"use client"

import { StressCase } from "@/app/examples/stress-case"
import { PartyPanel } from "@/registry/ui/party-panel"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Ficha</h1>
      <StressCase label="Vacío"><PartyPanel state="empty" /></StressCase>
      <StressCase label="Carga y error"><PartyPanel state="loading" /><PartyPanel state="error" error="Fallo" /></StressCase>
      <StressCase label="320px" width={320}>
        <PartyPanel name={token} meta={token} facts={[{ id: "a", label: token, value: token }]} members={[{ id: "m", name: token, role: token }]} files={[{ id: "f", name: token, detail: token }]} secrets={[{ id: "s", label: "CURP", masked: "••••", revealed: token }]} />
      </StressCase>
      <StressCase label="Diez miembros">
        <PartyPanel name="Taller" members={Array.from({ length: 10 }, (_, index) => ({ id: `m${index}`, name: `Persona ${index}`, role: "Rol" }))} />
      </StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><PartyPanel name="ورشة" meta="منذ ٢٠٢٤" facts={[{ id: "a", label: "المرحلة", value: "مفتوح" }]} /></div></StressCase>
    </main>
  )
}
