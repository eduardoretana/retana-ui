"use client"

import * as React from "react"

import { AnatomyTree } from "@/registry/retana/ui/anatomy-tree"
import { BodyMap } from "@/registry/retana/ui/body-map"
import { DermatomeMap, type DermatomeId } from "@/registry/retana/ui/dermatome-map"
import { DnaHelix } from "@/registry/retana/ui/dna-helix"
import { EcgTrace, syntheticEcg } from "@/registry/retana/ui/ecg-trace"
import { GrowthChart, type GrowthStandard } from "@/registry/retana/ui/growth-chart"
import { ImageViewer, ctWindowPresets } from "@/registry/retana/ui/image-viewer"
import { LabResultsTable, type LabResult } from "@/registry/retana/ui/lab-results"
import { MedicationSchedule, type DoseStatus } from "@/registry/retana/ui/medication-schedule"
import { MoleculeViewer } from "@/registry/retana/ui/molecule-viewer"
import { Heart } from "@/registry/retana/ui/organ-heart"
import { VitalSigns } from "@/registry/retana/ui/vital-signs"
import { createHeadPhantom } from "@/registry/retana/lib/image-viewer-head-phantom"

/* ── Datos de ejemplo (ficticios) ─────────────────────────────── */

const anatomy = [
  {
    id: "rodilla",
    label: "Rodilla",
    children: [
      { id: "lca", label: "Ligamento cruzado anterior" },
      { id: "menisco-medial", label: "Menisco medial" },
      { id: "rotula", label: "Rótula" },
    ],
  },
  {
    id: "hombro",
    label: "Hombro",
    children: [
      { id: "supraespinoso", label: "Supraespinoso" },
      { id: "infraespinoso", label: "Infraespinoso" },
    ],
  },
]

export const labResults: LabResult[] = [
  {
    id: "pcr",
    name: "Proteína C reactiva",
    value: 7.8,
    unit: "mg/L",
    date: "2026-10-01",
    referenceRange: { low: 0, high: 5, criticalHigh: 100 },
    history: [
      { value: 3.1, date: "2026-04-02" },
      { value: 5.6, date: "2026-07-10" },
      { value: 7.8, date: "2026-10-01" },
    ],
  },
  {
    id: "vitamina-d",
    name: "Vitamina D (25-OH)",
    value: 31,
    unit: "ng/mL",
    date: "2026-10-01",
    referenceRange: { low: 30, high: 100 },
  },
  {
    id: "ck",
    name: "Creatina cinasa",
    value: 412,
    unit: "U/L",
    date: "2026-10-01",
    referenceRange: { low: 30, high: 200, criticalHigh: 5000 },
  },
]

const medications = [
  { id: "ibuprofeno", name: "Ibuprofeno", dose: "400 mg", times: ["08:00", "16:00"] },
  { id: "omeprazol", name: "Omeprazol", dose: "20 mg", times: ["07:30"] },
]
const interactions = [
  {
    id: "ibuprofeno-omeprazol",
    medicationIds: ["ibuprofeno", "omeprazol"],
    severity: "minor" as const,
    summary: "Ejemplo ficticio: verifica interacciones con tu propia fuente.",
  },
]

/** Curva ilustrativa (no es la tabla OMS). Pasa tus propias tablas con licencia. */
function illustrativeStandard(start: number, slope: number): GrowthStandard {
  const lms = Array.from({ length: 25 }, (_, month) => [1, start + slope * Math.sqrt(month), 0.11] as const)
  return { female: { start: 0, lms }, male: { start: 0, lms } }
}

/* ── Demos ────────────────────────────────────────────────────── */

export function AnatomyTreeDemo() {
  const [selectedId, select] = React.useState<string | null>(null)
  const [visibility, show] = React.useState<Record<string, boolean>>({})
  return (
    <AnatomyTree
      data={anatomy}
      selectedId={selectedId}
      onSelectionChange={select}
      visibility={visibility}
      onVisibilityChange={show}
      defaultExpandedIds={["rodilla"]}
    />
  )
}

export function VitalSignsDemo() {
  return (
    <VitalSigns
      readings={{ heartRate: 88, systolic: 134, diastolic: 86, spo2: 97, temperature: 36.7 }}
      description="Tomados al inicio de la sesión, 09:30"
    />
  )
}

export function EcgTraceDemo() {
  const samples = React.useMemo(() => syntheticEcg({ duration: 6, sampleRate: 250, heartRate: 72 }), [])
  return <EcgTrace samples={samples} sampleRate={250} lead="II" />
}

export function BodyMapDemo() {
  const [regions, setRegions] = React.useState<string[]>(["right-knee"])
  return <BodyMap label="¿Dónde duele?" value={regions} onValueChange={setRegions} name="regiones" />
}

export function DermatomeMapDemo() {
  const [selectedId, select] = React.useState<DermatomeId | null>(null)
  return <DermatomeMap selectedId={selectedId} onSelectionChange={select} />
}

export function LabResultsDemo() {
  return <LabResultsTable results={labResults} caption="Panel inflamatorio (ejemplo)" />
}

export function GrowthChartDemo() {
  const standards = React.useMemo(() => ({ weight: illustrativeStandard(3.3, 1.35) }), [])
  return (
    <GrowthChart
      standards={standards}
      measure="weight"
      sex="female"
      measurements={[
        { ageMonths: 6, value: 7.2 },
        { ageMonths: 12, value: 8.9 },
      ]}
      label="Peso para la edad (curva ilustrativa)"
    />
  )
}

export function MedicationScheduleDemo() {
  const [date, setDate] = React.useState("2026-10-21")
  const [doseStatus, setDoseStatus] = React.useState<Record<string, DoseStatus>>({})
  return (
    <MedicationSchedule
      medications={medications}
      interactions={interactions}
      date={date}
      onDateChange={setDate}
      doseStatus={doseStatus}
      onDoseStatusChange={setDoseStatus}
    />
  )
}

const phantom = createHeadPhantom()
export function ImageViewerDemo() {
  const [slice, setSlice] = React.useState(15)
  return (
    <div className="h-[28rem]">
      <ImageViewer {...phantom} presets={ctWindowPresets} slice={slice} onSliceChange={setSlice} />
    </div>
  )
}

export function OrganViewerDemo() {
  return (
    <div className="h-[28rem]">
      <Heart label="Visor de órgano: corazón" />
    </div>
  )
}

export function MoleculeViewerDemo() {
  const [selectedId, select] = React.useState<string | null>(null)
  return (
    <div className="h-[28rem]">
      <MoleculeViewer src="https://files.rcsb.org/download/1CRN.cif" selectedId={selectedId} onSelectionChange={select} />
    </div>
  )
}

export function DnaHelixDemo() {
  const [selected, select] = React.useState<number | null>(null)
  return (
    <div className="h-[24rem]">
      <DnaHelix sequence="ATGCGTACCTGAGCTTAACG" selectedIndex={selected} onSelectionChange={select} />
    </div>
  )
}

/* ── Miniaturas del catálogo (ligeras, sin WebGL) ─────────────── */

export function StaticThumb({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex h-full min-h-32 flex-col justify-end gap-1 rounded-lg border bg-muted/40 p-4">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{detail}</span>
    </div>
  )
}
