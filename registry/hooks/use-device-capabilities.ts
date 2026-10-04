"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/lib/use-environment.ts

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"

/** Browser, device, and feature flags. Detection never prompts for permission. */
export type DeviceCapabilities = {
  browser: { name: string; version: string; engine: string }
  device: { type: "desktop" | "mobile" | "tablet" | "unknown"; os: string; osVersion: string }
  hardware: { cores: number; memory?: number; gpu?: string }
  features: {
    webgpu: boolean
    webnn: boolean
    wasm: boolean
    simd: boolean
    threads: boolean
    indexeddb: boolean
    opfs: boolean
    workers: boolean
    sharedarraybuffer: boolean
    crossOriginIsolated: boolean
    serviceworker: boolean
    broadcastchannel: boolean
    weblocks: boolean
    chromeAI: boolean
    camera: boolean
    microphone: boolean
  }
  storage: { quotaBytes: number; usedBytes: number; availableBytes: number; isPersisted: boolean }
}

export type StorageQuota = {
  usedBytes: number
  quotaBytes: number
  percentUsed: number
  isPersisted: boolean
  availableBytes: number
}

export type NetworkStatus = {
  online: boolean
  isOnline: boolean
  isOffline: boolean
  effectiveType?: string
  saveData: boolean
}

type NetworkInformation = {
  effectiveType?: string
  saveData?: boolean
  addEventListener?: (type: string, listener: () => void) => void
  removeEventListener?: (type: string, listener: () => void) => void
}

type GpuAdapter = {
  info?: { description?: string; device?: string }
  requestAdapterInfo?: () => Promise<{ description?: string; device?: string }>
}

const SERVER_NETWORK: NetworkStatus = {
  online: true,
  isOnline: true,
  isOffline: false,
  effectiveType: undefined,
  saveData: false,
}

let networkCache: NetworkStatus = SERVER_NETWORK
let capabilityTask: Promise<DeviceCapabilities> | null = null

function connectionOf(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined
  const nav = navigator as Navigator & {
    connection?: NetworkInformation
    mozConnection?: NetworkInformation
    webkitConnection?: NetworkInformation
  }
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection
}

function readNetwork(): NetworkStatus {
  const online = typeof navigator === "undefined" ? true : navigator.onLine
  const connection = connectionOf()
  const next: NetworkStatus = {
    online,
    isOnline: online,
    isOffline: !online,
    effectiveType: connection?.effectiveType,
    saveData: Boolean(connection?.saveData),
  }
  if (
    next.online === networkCache.online &&
    next.effectiveType === networkCache.effectiveType &&
    next.saveData === networkCache.saveData
  ) {
    return networkCache
  }
  networkCache = next
  return networkCache
}

function subscribeNetwork(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("online", onStoreChange)
  window.addEventListener("offline", onStoreChange)
  const connection = connectionOf()
  connection?.addEventListener?.("change", onStoreChange)
  return () => {
    window.removeEventListener("online", onStoreChange)
    window.removeEventListener("offline", onStoreChange)
    connection?.removeEventListener?.("change", onStoreChange)
  }
}

async function requestWebGpuAdapter() {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) return null
  try {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<GpuAdapter | null> } }).gpu
    return (await gpu?.requestAdapter()) ?? null
  } catch {
    return null
  }
}

function wasmSupported() {
  try {
    if (typeof WebAssembly !== "object" || typeof WebAssembly.instantiate !== "function") return false
    const wasmModule = new WebAssembly.Module(Uint8Array.of(0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))
    return wasmModule instanceof WebAssembly.Module && new WebAssembly.Instance(wasmModule) instanceof WebAssembly.Instance
  } catch {
    return false
  }
}

function simdSupported() {
  try {
    new WebAssembly.Module(
      new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b, 0x03, 0x02, 0x01,
        0x00, 0x0a, 0x0a, 0x01, 0x08, 0x00, 0x41, 0x00, 0xfd, 0x0f, 0x00, 0x00, 0x0b,
      ]),
    )
    return true
  } catch {
    return false
  }
}

function threadsSupported() {
  try {
    if (typeof SharedArrayBuffer === "undefined" || typeof Atomics === "undefined") return false
    new WebAssembly.Module(
      new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x60, 0x00, 0x00, 0x03, 0x02, 0x01, 0x00,
        0x05, 0x04, 0x01, 0x03, 0x01, 0x01, 0x0a, 0x0b, 0x01, 0x09, 0x00, 0x41, 0x00, 0xfe, 0x10, 0x02, 0x00, 0x1a,
        0x0b,
      ]),
    )
    return true
  } catch {
    return false
  }
}

function detectBrowser() {
  if (typeof navigator === "undefined") return { name: "unknown", version: "0", engine: "unknown" }
  const ua = navigator.userAgent
  if (ua.includes("Edg/")) return { name: "Edge", version: ua.match(/Edg\/(\d+(?:\.\d+)*)/)?.[1] ?? "unknown", engine: "Blink" }
  if (ua.includes("Chrome/")) return { name: "Chrome", version: ua.match(/Chrome\/(\d+(?:\.\d+)*)/)?.[1] ?? "unknown", engine: "Blink" }
  if (ua.includes("Firefox/")) return { name: "Firefox", version: ua.match(/Firefox\/(\d+(?:\.\d+)*)/)?.[1] ?? "unknown", engine: "Gecko" }
  if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    return { name: "Safari", version: ua.match(/Version\/(\d+(?:\.\d+)*)/)?.[1] ?? "unknown", engine: "WebKit" }
  }
  return { name: "unknown", version: "0", engine: "unknown" }
}

function detectOs() {
  if (typeof navigator === "undefined") return { name: "unknown", version: "0" }
  const ua = navigator.userAgent
  if (ua.includes("Windows")) {
    const nt = ua.match(/Windows NT (\d+(?:\.\d+)*)/)?.[1] ?? "10"
    return { name: "Windows", version: nt === "10.0" ? "10/11" : nt }
  }
  if (ua.includes("Mac OS X")) {
    return { name: "macOS", version: ua.match(/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/)?.[1]?.replaceAll("_", ".") ?? "unknown" }
  }
  if (ua.includes("iPhone") || ua.includes("iPad")) {
    return { name: "iOS", version: ua.match(/OS (\d+[._]\d+(?:[._]\d+)?)/)?.[1]?.replaceAll("_", ".") ?? "unknown" }
  }
  if (ua.includes("Android")) return { name: "Android", version: ua.match(/Android (\d+(?:\.\d+)*)/)?.[1] ?? "unknown" }
  if (ua.includes("Linux")) return { name: "Linux", version: "unknown" }
  return { name: "unknown", version: "0" }
}

function detectDeviceType(): DeviceCapabilities["device"]["type"] {
  if (typeof navigator === "undefined") return "unknown"
  const ua = navigator.userAgent
  if (ua.includes("iPad") || (ua.includes("Android") && !ua.includes("Mobile"))) return "tablet"
  if (ua.includes("iPhone") || ua.includes("Android") && ua.includes("Mobile")) return "mobile"
  if (navigator.maxTouchPoints > 0 && typeof screen !== "undefined" && screen.width < 1024) return "tablet"
  return "desktop"
}

function detectWebGlGpu() {
  if (typeof document === "undefined") return undefined
  try {
    const canvas = document.createElement("canvas")
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null
    if (!gl) return undefined
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
    if (!debugInfo) return undefined
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    return typeof renderer === "string" ? renderer : undefined
  } catch {
    return undefined
  }
}

async function detectMedia() {
  const none = { camera: false, microphone: false }
  if (typeof navigator === "undefined" || typeof navigator.mediaDevices?.enumerateDevices !== "function") return none
  if (typeof navigator.mediaDevices.getUserMedia !== "function") return none
  if (typeof isSecureContext !== "undefined" && !isSecureContext) return none
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return {
      camera: devices.some((device) => device.kind === "videoinput"),
      microphone: devices.some((device) => device.kind === "audioinput"),
    }
  } catch {
    return none
  }
}

async function readStorage() {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null
  try {
    const [estimate, persisted] = await Promise.all([
      navigator.storage.estimate(),
      navigator.storage.persisted?.() ?? Promise.resolve(false),
    ])
    return { quota: estimate.quota ?? 0, usage: estimate.usage ?? 0, persisted: Boolean(persisted) }
  } catch {
    return null
  }
}

async function detectImpl(): Promise<DeviceCapabilities> {
  const [adapter, storage, media] = await Promise.all([requestWebGpuAdapter(), readStorage(), detectMedia()])
  let gpu = detectWebGlGpu()
  if (adapter) {
    try {
      const info = adapter.info ?? (await adapter.requestAdapterInfo?.())
      gpu = info?.description || info?.device || gpu
    } catch {
      /* adapter info is optional */
    }
  }
  const os = detectOs()
  const quotaBytes = storage?.quota ?? 0
  const usedBytes = storage?.usage ?? 0
  return {
    browser: detectBrowser(),
    device: { type: detectDeviceType(), os: os.name, osVersion: os.version },
    hardware: {
      cores: typeof navigator !== "undefined" && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 1,
      memory: typeof navigator !== "undefined" ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory : undefined,
      gpu,
    },
    features: {
      webgpu: Boolean(adapter),
      webnn: typeof navigator !== "undefined" && "ml" in navigator,
      wasm: wasmSupported(),
      simd: simdSupported(),
      threads: threadsSupported(),
      indexeddb: typeof indexedDB !== "undefined",
      opfs: typeof navigator !== "undefined" && typeof navigator.storage?.getDirectory === "function",
      workers: typeof Worker !== "undefined",
      sharedarraybuffer: typeof SharedArrayBuffer !== "undefined",
      crossOriginIsolated: typeof crossOriginIsolated !== "undefined" && crossOriginIsolated,
      serviceworker: typeof navigator !== "undefined" && "serviceWorker" in navigator,
      broadcastchannel: typeof BroadcastChannel !== "undefined",
      weblocks: typeof navigator !== "undefined" && "locks" in navigator,
      chromeAI: typeof self !== "undefined" && "ai" in self,
      camera: media.camera,
      microphone: media.microphone,
    },
    storage: {
      quotaBytes,
      usedBytes,
      availableBytes: Math.max(0, quotaBytes - usedBytes),
      isPersisted: storage?.persisted ?? false,
    },
  }
}

/** One shared detection pass. `refresh()` on the hook clears this cache. */
export function detectCapabilities() {
  if (typeof window === "undefined") return Promise.resolve(null)
  capabilityTask ??= detectImpl().catch((error: unknown) => {
    capabilityTask = null
    throw error
  })
  return capabilityTask
}

export function resetCapabilityCache() {
  capabilityTask = null
}

/** Compact byte label, for example `1.2 GB`. */
export function formatBytes(bytes: number, locale = "en") {
  if (!Number.isFinite(bytes)) return "—"
  const sign = bytes < 0 ? "-" : ""
  let value = Math.abs(bytes)
  const units = ["B", "KB", "MB", "GB", "TB"]
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  const digits = unit === 0 ? 0 : 1
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
  return `${sign}${formatted} ${units[unit]}`
}

export async function getStorageQuota(): Promise<StorageQuota | null> {
  const storage = await readStorage()
  if (!storage) return null
  return {
    usedBytes: storage.usage,
    quotaBytes: storage.quota,
    percentUsed: storage.quota > 0 ? (storage.usage / storage.quota) * 100 : 0,
    isPersisted: storage.persisted,
    availableBytes: Math.max(0, storage.quota - storage.usage),
  }
}

/** Browser capability snapshot. `loading` stays true until the first detection finishes, including on the server. */
export function useCapabilities() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return
    resetCapabilityCache()
    setLoading(true)
    setError(null)
    try {
      setCapabilities(await detectCapabilities())
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let alive = true
    detectCapabilities()
      .then((next) => {
        if (alive) setCapabilities(next)
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return { capabilities, loading, error, refresh }
}

export function useStorageQuota() {
  const [quota, setQuota] = useState<StorageQuota | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return
    setLoading(true)
    setError(null)
    try {
      setQuota(await getStorageQuota())
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [])

  const requestPersist = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.storage?.persist) return false
    const granted = await navigator.storage.persist()
    await refresh()
    return granted
  }, [refresh])

  useEffect(() => {
    let alive = true
    getStorageQuota()
      .then((next) => {
        if (alive) setQuota(next)
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return { quota, loading, error, refresh, requestPersist }
}

/** Online state, effective connection type, and the save-data hint. */
export function useNetworkStatus(): NetworkStatus {
  return useSyncExternalStore(subscribeNetwork, readNetwork, () => SERVER_NETWORK)
}
