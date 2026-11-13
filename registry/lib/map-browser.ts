// Red stub (TDD). Real implementation lands in the next commit.
import type { StyleSpecification } from "maplibre-gl"
import type { ReactNode } from "react"
export type GeoPoint = { lng: number; lat: number }
export type MapTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"
export type MapPlace<TMeta = unknown> = { id: string; title: string; subtitle?: string; position: GeoPoint; category?: string; meta?: TMeta }
export type MapCategory = { id: string; label: string; tone?: MapTone; icon?: ReactNode }
export type MapStyle = string | StyleSpecification | ((token: (name: string) => string) => StyleSpecification | string)
export type MapProvider = { styles: { light: MapStyle; dark?: MapStyle }; attribution: string; workerUrl?: string; maxZoom?: number }
const todo = (): never => {
  throw new Error("not implemented")
}
export const viewState = (_: { places: readonly unknown[]; total: number; status?: string }): string => todo()
export const boundsOf = (_: readonly MapPlace[]): unknown => todo()
export const tokenColor = (_: string, __?: Element): string => todo()
export const mapBrowserLabelsEn = {}
