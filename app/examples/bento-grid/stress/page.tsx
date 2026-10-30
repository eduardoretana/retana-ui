"use client"

import { BentoCell, BentoGrid } from "@/registry/ui/bento-grid"
import { BentoFeatureCard } from "@/registry/ui/bento-feature-card"

import { filled } from "../fixtures"
import { bentoIcons, BentoSketch } from "../media"

const token = "Y".repeat(60)
const cells = filled.es.cells

function Card({
  title,
  description,
  cta,
  href,
  media = true,
  id = "horno",
}: {
  title: string
  description: string
  cta?: string
  href?: string
  media?: boolean
  id?: string
}) {
  return (
    <BentoFeatureCard
      title={title}
      description={description}
      cta={cta}
      href={href}
      icon={bentoIcons.flame}
      illustration={media ? <BentoSketch id={id} /> : undefined}
    />
  )
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Familia bento</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Vacío, una palabra, frases y token de 60</h2>
        <BentoGrid label="Largos" columns={4}>
          <BentoCell>
            <Card title="" description="" />
          </BentoCell>
          <BentoCell>
            <Card title="Horno" description="Una" href="#a" cta="Ver" />
          </BentoCell>
          <BentoCell span={{ col: 2, row: 1 }}>
            <Card
              title="El horno norte guarda el turno de la mañana y la prueba de esmalte del sábado."
              description="Varias frases. El texto se parte. El enlace sigue siendo uno solo."
              href="#b"
              cta="Ver agenda"
            />
          </BentoCell>
          <BentoCell span={{ col: 2, row: 1 }}>
            <Card title={token} description={token} href="#c" cta="Ver" />
          </BentoCell>
        </BentoGrid>
      </section>

      <section className="flex flex-col gap-3" dir="rtl">
        <h2 className="text-sm font-medium">Emoji, números y derecha a izquierda</h2>
        <BentoGrid label="RTL" columns={2}>
          <BentoCell>
            <Card title="🔥 1.250,00 مرشحة" description="١٢ caja · 🙂🙂🙂" href="#rtl" cta="فتح" />
          </BentoCell>
          <BentoCell>
            <Card title="1180" description="06:00–14:00" href="#num" cta="Ver" media={false} />
          </BentoCell>
        </BentoGrid>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Cantidad: 0, 1, el muro y diez</h2>
        <BentoGrid label="Cero" emptyLabel="Sin piezas" />
        <BentoGrid label="Una" columns={4}>
          <BentoCell span={{ col: 2, row: 2 }}>
            <Card title={cells[0]!.title} description={cells[0]!.description} href="#una" cta="Ver agenda" />
          </BentoCell>
        </BentoGrid>
        <BentoGrid label="Muro" columns={4}>
          {cells.map((cell) => (
            <BentoCell key={cell.id} span={cell.span}>
              <BentoFeatureCard
                title={cell.title}
                description={cell.description}
                cta={cell.cta}
                href={cell.href}
                icon={bentoIcons[cell.icon]}
                illustration={<BentoSketch id={cell.id} />}
              />
            </BentoCell>
          ))}
        </BentoGrid>
        <BentoGrid label="Diez" columns={4}>
          {Array.from({ length: 10 }, (_, index) => (
            <BentoCell key={index} span={{ col: index === 0 ? 2 : 1, row: 1 }}>
              <Card title={`Pieza ${index + 1}`} description="Una línea." href={`#p${index}`} cta="Ver" media={index % 2 === 0} />
            </BentoCell>
          ))}
        </BentoGrid>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Contenedor 320 px, 390 px, apretado y ancho</h2>
        <div className="w-80 max-w-full">
          <BentoGrid label="320" columns={4}>
            {cells.map((cell) => (
              <BentoCell key={cell.id} span={cell.span}>
                <Card title={cell.title} description={cell.description} href={cell.href} cta={cell.cta} id={cell.id} />
              </BentoCell>
            ))}
          </BentoGrid>
        </div>
        <div className="w-[390px] max-w-full border border-dashed border-border p-2">
          <p className="mb-2 text-xs text-muted-foreground">390 px</p>
          <BentoGrid label="390" columns={4}>
            {cells.map((cell) => (
              <BentoCell key={cell.id} span={cell.span}>
                <Card title={cell.title} description={cell.description} href={cell.href} cta={cell.cta} id={cell.id} />
              </BentoCell>
            ))}
          </BentoGrid>
        </div>
        <div className="flex min-w-0 gap-2">
          <div className="w-16 shrink-0 rounded-lg bg-muted" />
          <BentoGrid label="Apretado" className="min-w-0 flex-1" columns={4}>
            <BentoCell span={{ col: 2, row: 1 }}>
              <Card title={token} description="Al lado de un hermano." href="#side" cta="Ver" />
            </BentoCell>
          </BentoGrid>
        </div>
        <div className="w-[1200px] max-w-full">
          <BentoGrid label="Ancho" columns={4}>
            {cells.map((cell) => (
              <BentoCell key={cell.id} span={cell.span}>
                <Card title={cell.title} description={cell.description} href={cell.href} cta={cell.cta} id={cell.id} />
              </BentoCell>
            ))}
          </BentoGrid>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Carga, vacío, error, sin CTA y sin ilustración</h2>
        <BentoGrid label="Cargando" status="loading" loadingLabel="Cargando el muro del taller…" />
        <BentoGrid label="Vacío" status="empty" emptyLabel="Todavía no hay piezas en el muro." />
        <BentoGrid label="Error" status="error" errorLabel="No se pudo cargar el muro. Inténtalo de nuevo." />
        <BentoGrid label="Parcial" columns={2}>
          <BentoCell>
            <Card title="Sin CTA" description="La tarjeta no es un enlace." />
          </BentoCell>
          <BentoCell>
            <Card title="Sin ilustración" description="Solo texto y el enlace." href="#solo" cta="Ver agenda" media={false} />
          </BentoCell>
        </BentoGrid>
        <BentoFeatureCard status="loading" loadingLabel="Cargando horno" />
        <BentoFeatureCard status="error" errorLabel="No se pudo abrir la ficha." />
      </section>
    </main>
  )
}
