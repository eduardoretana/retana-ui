// Red stub (TDD). Real implementation lands in the next commit.
import type { MapCategory, MapPlace, MapProvider } from "@/registry/retana/lib/map-browser"
export type MapBrowserProps = {
  places: readonly MapPlace[]
  total: number
  provider: MapProvider
  categories?: readonly MapCategory[]
  [key: string]: unknown
}
export function MapBrowser(_props: MapBrowserProps) {
  return null
}
