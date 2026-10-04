"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/src/components/capabilities-panel.tsx

import { Check, Info, X } from "lucide-react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatBytes, useCapabilities, type DeviceCapabilities } from "@/registry/retana/hooks/use-device-capabilities"

type FeatureKey = keyof DeviceCapabilities["features"]

const FEATURES: { key: FeatureKey; label: string; detail: string }[] = [
  { key: "webgpu", label: "WebGPU", detail: "Graphics and compute on the GPU." },
  { key: "wasm", label: "WASM", detail: "WebAssembly modules can run." },
  { key: "simd", label: "SIMD", detail: "Vector instructions inside WebAssembly." },
  { key: "threads", label: "Threads", detail: "Shared memory threads, when the page is isolated." },
  { key: "indexeddb", label: "IndexedDB", detail: "Structured storage in the browser." },
  { key: "opfs", label: "OPFS", detail: "Origin private file system." },
  { key: "workers", label: "Workers", detail: "Background threads via Worker." },
  { key: "sharedarraybuffer", label: "SharedArrayBuffer", detail: "Shared memory between workers." },
  { key: "crossOriginIsolated", label: "Isolated", detail: "The page is cross-origin isolated." },
  { key: "serviceworker", label: "Service worker", detail: "Offline caching is available." },
  { key: "broadcastchannel", label: "Broadcast", detail: "Tabs can message each other." },
  { key: "weblocks", label: "Web Locks", detail: "Cooperative locks across tabs." },
  { key: "chromeAI", label: "Built-in AI", detail: "A browser AI surface is present. Availability only." },
  { key: "camera", label: "Camera", detail: "A camera is listed. This check does not ask for permission." },
  { key: "microphone", label: "Microphone", detail: "A microphone is listed. This check does not ask for permission." },
]

export type CapabilityGridProps = {
  features?: { key: FeatureKey; label: string; detail?: string }[]
  footnote?: string
  className?: string
}

function Stat({ label, value, about }: { label: string; value: string; about: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label={`About ${label}`} className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <Info className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{about}</TooltipContent>
        </Tooltip>
      </div>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

export function CapabilityGrid({
  features,
  footnote = "Detected locally. Nothing is sent anywhere.",
  className,
}: CapabilityGridProps) {
  const { capabilities, loading } = useCapabilities()
  const dash = loading || !capabilities ? "—" : ""
  const list = features ?? FEATURES
  return (
    <TooltipProvider>
      <section className={cn("flex flex-col gap-4", className)}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Browser" value={dash || `${capabilities?.browser.name} ${capabilities?.browser.version}`} about="Read from the user agent." />
          <Stat label="Device" value={dash || `${capabilities?.device.type}, ${capabilities?.device.os}`} about="A coarse device class." />
          <Stat label="CPU cores" value={dash || String(capabilities?.hardware.cores ?? "—")} about="navigator.hardwareConcurrency." />
          <Stat label="Memory" value={dash || (capabilities?.hardware.memory ? `${capabilities.hardware.memory} GB` : "—")} about="deviceMemory when the browser exposes it." />
          <Stat label="Storage" value={dash || formatBytes(capabilities?.storage.quotaBytes ?? 0)} about="Storage estimate for this origin." />
          <Stat label="GPU" value={dash || capabilities?.hardware.gpu || "—"} about="WebGPU adapter info, or the WebGL renderer." />
        </div>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
          {list.map((feature) => {
            const known = Boolean(capabilities)
            const supported = known && capabilities?.features[feature.key]
            const state = !known ? "unknown" : supported ? "supported" : "unsupported"
            return (
              <li key={feature.key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-1 rounded-md px-2 py-1.5 text-left text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        state === "supported" && "bg-primary/10 text-primary",
                        state === "unsupported" && "bg-muted text-muted-foreground",
                        state === "unknown" && "border border-dashed border-border text-muted-foreground",
                      )}
                    >
                      <span>{feature.label}</span>
                      {state === "supported" ? <Check aria-hidden="true" className="size-3" /> : null}
                      {state === "unsupported" ? <X aria-hidden="true" className="size-3" /> : null}
                      <span className="sr-only">{`${feature.label}: ${state}`}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{feature.detail ?? feature.label}</TooltipContent>
                </Tooltip>
              </li>
            )
          })}
        </ul>
        <p className="text-xs text-muted-foreground">{footnote}</p>
      </section>
    </TooltipProvider>
  )
}
