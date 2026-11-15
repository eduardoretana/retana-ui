"use client"

import "maplibre-gl/dist/maplibre-gl.css"

import { StressCase } from "@/app/examples/stress-case"
import { MapBrowser, mapBrowserLabelsEn } from "@/registry/blocks/map-browser"

import { categoriesFor, manyPlaces, provider } from "../fixtures"

const token = "N".repeat(60)
const categories = categoriesFor("es")
const one = [{ id: "solo", title: "Nodo Solo", subtitle: "Valle Norte", category: "office", position: { lng: -99.15, lat: 19.43 } }]
const long = [
  { id: "l1", title: token, subtitle: token, category: "office", position: { lng: -99.16, lat: 19.44 } },
  {
    id: "l2",
    title: "Centro de distribución y punto de entrega con horario extendido de fin de semana",
    subtitle: "Avenida del Valle Inventado número 1234, interior 56, Barrio del Puente, Valle Norte",
    category: "pickup",
    position: { lng: -99.12, lat: 19.41 },
  },
]
const many = manyPlaces(500)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Explorador de mapa</h1>
      <StressCase label="Cero lugares">
        <div className="h-[36rem]">
          <MapBrowser places={[]} total={0} provider={provider} />
        </div>
      </StressCase>
      <StressCase label="Un lugar">
        <div className="h-[36rem]">
          <MapBrowser places={one} total={1} provider={provider} categories={categories} />
        </div>
      </StressCase>
      <StressCase label="Quinientos lugares (clúster)">
        <div className="h-[36rem]">
          <MapBrowser places={many} total={many.length} provider={provider} categories={categories} />
        </div>
      </StressCase>
      <StressCase label="Textos largos · 390px" width={390}>
        <div className="h-[44rem]">
          <MapBrowser places={long} total={2} provider={provider} categories={categories} />
        </div>
      </StressCase>
      <StressCase label="English · RTL" width={390}>
        <div dir="rtl" className="h-[40rem]">
          <MapBrowser places={one} total={1} provider={provider} categories={categories} labels={mapBrowserLabelsEn} />
        </div>
      </StressCase>
      <StressCase label="Carga y error">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[30rem]">
            <MapBrowser places={[]} total={0} status="loading" provider={provider} />
          </div>
          <div className="h-[30rem]">
            <MapBrowser places={[]} total={4} status="error" provider={provider} onRetry={() => {}} />
          </div>
        </div>
      </StressCase>
    </main>
  )
}
