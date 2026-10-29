"use client"

import { BentoFeatureCard } from "@/registry/ui/bento-feature-card"

import { bentoIcons, BentoSketch } from "../../bento-grid/media"

const token = "Y".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tarjeta de función</h1>
      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="text-sm font-medium sm:col-span-2">Vacío, una palabra, frases y token</h2>
        <BentoFeatureCard title="" description="" />
        <BentoFeatureCard title="Horno" description="Una" href="#a" cta="Ver" icon={bentoIcons.flame} />
        <BentoFeatureCard
          title="El horno norte guarda el turno de la mañana y la prueba de esmalte del sábado."
          description="Varias frases caben en la celda sin salir del anillo."
          href="#b"
          cta="Ver agenda"
          illustration={<BentoSketch id="horno" />}
          icon={bentoIcons.flame}
        />
        <BentoFeatureCard title={token} description={token} href="#c" cta="Ver" icon={bentoIcons.flame} />
      </section>
      <section className="grid gap-4" dir="rtl">
        <h2 className="text-sm font-medium">Emoji, números y derecha a izquierda</h2>
        <BentoFeatureCard title="🔥 1.250,00 مرشحة" description="١٢ caja" href="#rtl" cta="فتح" icon={bentoIcons.drops} />
      </section>
      <section className="flex w-80 max-w-full flex-col gap-3">
        <h2 className="text-sm font-medium">320 px, sin CTA y sin ilustración</h2>
        <BentoFeatureCard title="Sin CTA" description="No hay segundo control." icon={bentoIcons.box} illustration={<BentoSketch id="empaque" />} />
        <BentoFeatureCard title="Sin dibujo" description="El texto ocupa la tarjeta." href="#solo" cta="Ver agenda" icon={bentoIcons.frames} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Carga, vacío y error</h2>
        <BentoFeatureCard status="loading" loadingLabel="Cargando horno" />
        <BentoFeatureCard status="empty" emptyLabel="Sin ficha" />
        <BentoFeatureCard status="error" errorLabel="No se pudo abrir la ficha." />
      </section>
    </main>
  )
}
