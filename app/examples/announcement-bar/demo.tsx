"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { AnnouncementBar } from "@/registry/ui/announcement-bar"

const messages = [
  { id: "kiln", message: `${atelier.kiln} ya está en temperatura.` },
  { id: "gallery", message: `La galería de ${atelier.city} abre el viernes.`, action: { label: "Ver", href: "#galeria" } },
  { id: "sale", message: "El lote de gres cierra pronto.", countdown: { to: Date.now() + 1000 * 60 * 60 * 26, label: "quedan" } },
]

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <AnnouncementBar messages={messages} controls label="Avisos del taller" />
      <StressCases
        empty={<AnnouncementBar messages={[]} />}
        long={<AnnouncementBar messages={[{ id: "long", message: unbreakable }]} autoPlay={false} />}
        crowded={
          <AnnouncementBar
            controls
            autoPlay={false}
            messages={Array.from({ length: 10 }, (_, index) => ({ id: `m-${index}`, message: `Aviso ${index + 1} del taller` }))}
          />
        }
      />
    </div>
  )
}
