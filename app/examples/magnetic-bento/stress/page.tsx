import { Compass } from "lucide-react"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { MagneticBentoGrid } from "@/registry/blocks/magnetic-bento"
import {
  MagneticBento,
  MagneticBentoCta,
  MagneticBentoDescription,
  MagneticBentoIcon,
  MagneticBentoIndex,
  MagneticBentoItem,
  MagneticBentoTitle,
  type MagneticBentoAccent,
} from "@/registry/ui/magnetic-bento"

const accents: MagneticBentoAccent[] = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "primary"]

export default function MagneticBentoStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · rejilla magnética</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            320px, un título sin espacios, dirección RTL, una tarjeta, doce tarjetas y emoji. El resalte sigue a la
            tarjeta después del reflow.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <MagneticBentoGrid label="Taller estrecho" />
      </StressCase>
      <StressCase label="Título largo" width={320}>
        <MagneticBento label="Título largo" defaultActive="largo">
          <MagneticBentoItem value="largo" accent="chart-3">
            <MagneticBentoIcon>
              <Compass className="size-5" />
            </MagneticBentoIcon>
            <MagneticBentoIndex>01</MagneticBentoIndex>
            <MagneticBentoTitle>{unbreakable}</MagneticBentoTitle>
            <MagneticBentoDescription>El texto no puede partirse en palabras.</MagneticBentoDescription>
            <MagneticBentoCta href="#largo">Abrir</MagneticBentoCta>
          </MagneticBentoItem>
        </MagneticBento>
      </StressCase>
      <StressCase label="RTL">
        <div dir="rtl">
          <MagneticBentoGrid label="ورشة" />
        </div>
      </StressCase>
      <StressCase label="Una tarjeta">
        <MagneticBento label="Una" defaultActive="solo">
          <MagneticBentoItem value="solo" span={{ col: 2, row: 1 }} accent="primary">
            <MagneticBentoIndex>01</MagneticBentoIndex>
            <MagneticBentoTitle>Solo el horno</MagneticBentoTitle>
            <MagneticBentoDescription>La rejilla también funciona con una pieza.</MagneticBentoDescription>
            <MagneticBentoCta href="#solo">Ver</MagneticBentoCta>
          </MagneticBentoItem>
        </MagneticBento>
      </StressCase>
      <StressCase label="Doce tarjetas">
        <MagneticBento label="Doce" defaultActive="pieza-1">
          {Array.from({ length: 12 }, (_, index) => {
            const number = index + 1
            return (
              <MagneticBentoItem key={number} value={`pieza-${number}`} accent={accents[index % accents.length]}>
                <MagneticBentoIndex>{String(number).padStart(2, "0")}</MagneticBentoIndex>
                <MagneticBentoTitle>Pieza {number}</MagneticBentoTitle>
                <MagneticBentoDescription>Una tarjeta más en la misma rejilla.</MagneticBentoDescription>
              </MagneticBentoItem>
            )
          })}
        </MagneticBento>
      </StressCase>
      <StressCase label="Emoji" width={320}>
        <MagneticBento label="Emoji" defaultActive="emoji">
          <MagneticBentoItem value="emoji" accent="chart-4">
            <MagneticBentoIndex>🔥</MagneticBentoIndex>
            <MagneticBentoTitle>Horno 🔥🧪</MagneticBentoTitle>
            <MagneticBentoDescription>El esmalte sale ✨ y la caja espera 📦.</MagneticBentoDescription>
            <MagneticBentoCta href="#emoji">Abrir ↗</MagneticBentoCta>
          </MagneticBentoItem>
        </MagneticBento>
      </StressCase>
    </main>
  )
}
