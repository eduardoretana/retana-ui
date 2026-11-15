// A tile-free maplibre style for the demo and the captures. Shapes are inline
// GeoJSON of an invented valley; every color is read from a theme token at
// runtime, so light and dark follow the host. No glyphs, sprites or tiles.
import type { StyleSpecification } from "maplibre-gl"

const polygon = (ring: Array<[number, number]>) => ({
  type: "Feature" as const,
  properties: {},
  geometry: { type: "Polygon" as const, coordinates: [[...ring, ring[0]]] },
})
const line = (coords: Array<[number, number]>) => ({
  type: "Feature" as const,
  properties: {},
  geometry: { type: "LineString" as const, coordinates: coords },
})

const water = {
  type: "FeatureCollection" as const,
  features: [
    polygon([[-99.11, 19.395], [-99.07, 19.39], [-99.05, 19.415], [-99.075, 19.43], [-99.105, 19.42]]),
    polygon([[-99.25, 19.5], [-99.225, 19.49], [-99.22, 19.515], [-99.245, 19.525]]),
  ],
}
const parks = {
  type: "FeatureCollection" as const,
  features: [
    polygon([[-99.2, 19.42], [-99.18, 19.415], [-99.175, 19.435], [-99.195, 19.44]]),
    polygon([[-99.14, 19.47], [-99.125, 19.468], [-99.122, 19.482], [-99.138, 19.485]]),
    polygon([[-99.16, 19.37], [-99.135, 19.365], [-99.13, 19.38], [-99.155, 19.385]]),
  ],
}
const roads = {
  type: "FeatureCollection" as const,
  features: [
    line([[-99.3, 19.43], [-99.2, 19.432], [-99.13, 19.435], [-99.0, 19.44]]),
    line([[-99.15, 19.3], [-99.148, 19.4], [-99.152, 19.5], [-99.155, 19.56]]),
    line([[-99.26, 19.36], [-99.18, 19.4], [-99.1, 19.47], [-99.04, 19.52]]),
    line([[-99.24, 19.5], [-99.17, 19.47], [-99.09, 19.38], [-99.05, 19.35]]),
  ],
}

export function localStyle(token: (name: string) => string): StyleSpecification {
  return {
    version: 8,
    name: "retana-ui-local",
    sources: {
      water: { type: "geojson", data: water },
      parks: { type: "geojson", data: parks },
      roads: { type: "geojson", data: roads },
    },
    layers: [
      { id: "land", type: "background", paint: { "background-color": token("--muted") } },
      { id: "parks", type: "fill", source: "parks", paint: { "fill-color": token("--chart-2"), "fill-opacity": 0.18 } },
      { id: "water", type: "fill", source: "water", paint: { "fill-color": token("--chart-1"), "fill-opacity": 0.55 } },
      {
        id: "roads",
        type: "line",
        source: "roads",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": token("--border"), "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 6] },
      },
    ],
  }
}

/** A style URL that does not exist, for the map-error scene. Same origin, so a blocked network still fails it. */
export const missingStyle = "/examples/map-browser/style-not-found.json"
