// Fake maplibre-gl for jsdom (no WebGL). It records what the piece asks the
// map to do. Clustering is not simulated: a test sets `fake.clusters` to the
// features the native GeoJSON source would return.
type Handler = (event?: unknown) => void
type Feature = {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: Record<string, unknown>
}

export const fake = {
  maps: [] as FakeMap[],
  markers: [] as FakeMarker[],
  workerUrl: "",
  failConstructor: false,
  clusters: null as Feature[] | null,
  expansionZoom: 9,
  reset() {
    fake.maps = []
    fake.markers = []
    fake.workerUrl = ""
    fake.failConstructor = false
    fake.clusters = null
    fake.expansionZoom = 9
  },
  last() {
    return fake.maps[fake.maps.length - 1]
  },
}

class FakeSource {
  data: { features: Feature[] } = { features: [] }
  constructor(public options: Record<string, unknown>) {
    this.data = (options.data as { features: Feature[] }) ?? { features: [] }
  }
  setData(data: { features: Feature[] }) {
    this.data = data
  }
  getClusterExpansionZoom() {
    return Promise.resolve(fake.expansionZoom)
  }
}

export class FakeMap {
  handlers = new Map<string, Handler[]>()
  sources = new Map<string, FakeSource>()
  layers: Array<Record<string, unknown>> = []
  calls: Array<{ name: string; args: unknown[] }> = []
  zoom = 4
  removed = false
  container: HTMLElement
  constructor(public options: Record<string, unknown>) {
    if (fake.failConstructor) throw new Error("WebGL is not supported")
    this.container = options.container as HTMLElement
    fake.maps.push(this)
    queueMicrotask(() => {
      this.emit("load")
      this.emit("idle")
    })
  }
  on(name: string, handler: Handler) {
    const list = this.handlers.get(name) ?? []
    list.push(handler)
    this.handlers.set(name, list)
    return this
  }
  off(name: string, handler: Handler) {
    this.handlers.set(name, (this.handlers.get(name) ?? []).filter((h) => h !== handler))
    return this
  }
  once(name: string, handler: Handler) {
    const wrap: Handler = (e) => {
      this.off(name, wrap)
      handler(e)
    }
    return this.on(name, wrap)
  }
  emit(name: string, event?: unknown) {
    for (const handler of [...(this.handlers.get(name) ?? [])]) handler(event)
  }
  record(name: string, args: unknown[]) {
    this.calls.push({ name, args })
  }
  addSource(id: string, options: Record<string, unknown>) {
    this.sources.set(id, new FakeSource(options))
  }
  getSource(id: string) {
    return this.sources.get(id)
  }
  addLayer(layer: Record<string, unknown>) {
    this.layers.push(layer)
  }
  getLayer(id: string) {
    return this.layers.find((l) => l.id === id)
  }
  setPaintProperty(id: string, name: string, value: unknown) {
    this.record("setPaintProperty", [id, name, value])
  }
  removeLayer(id: string) {
    this.layers = this.layers.filter((l) => l.id !== id)
  }
  removeSource(id: string) {
    this.sources.delete(id)
  }
  isStyleLoaded() {
    return true
  }
  isSourceLoaded() {
    return true
  }
  setStyle(style: unknown) {
    this.record("setStyle", [style])
    queueMicrotask(() => this.emit("style.load"))
  }
  querySourceFeatures(id: string) {
    if (fake.clusters) return fake.clusters
    return this.sources.get(id)?.data.features ?? []
  }
  getZoom() {
    return this.zoom
  }
  getMaxZoom() {
    return 18
  }
  getBounds() {
    return { contains: () => true }
  }
  easeTo(options: unknown) {
    this.record("easeTo", [options])
  }
  flyTo(options: unknown) {
    this.record("flyTo", [options])
  }
  fitBounds(bounds: unknown, options: unknown) {
    this.record("fitBounds", [bounds, options])
  }
  zoomIn(options?: unknown) {
    this.record("zoomIn", [options])
  }
  zoomOut(options?: unknown) {
    this.record("zoomOut", [options])
  }
  resize() {}
  getCanvas() {
    return document.createElement("canvas")
  }
  remove() {
    this.removed = true
  }
}

export class FakeMarker {
  lngLat: [number, number] = [0, 0]
  element: HTMLElement
  map: FakeMap | null = null
  constructor(options: { element: HTMLElement }) {
    this.element = options.element
    fake.markers.push(this)
  }
  setLngLat(lngLat: [number, number]) {
    this.lngLat = lngLat
    return this
  }
  addTo(map: FakeMap) {
    this.map = map
    map.container.appendChild(this.element)
    return this
  }
  getElement() {
    return this.element
  }
  remove() {
    this.element.remove()
    this.map = null
    return this
  }
}

export function setWorkerUrl(url: string) {
  fake.workerUrl = url
}
export function getWorkerUrl() {
  return fake.workerUrl
}

const maplibre = { Map: FakeMap, Marker: FakeMarker, setWorkerUrl, getWorkerUrl }
export default maplibre
export { FakeMap as Map, FakeMarker as Marker }
