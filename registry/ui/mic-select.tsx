"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/audio/mic-selector/mic-selector.tsx

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { AudioBars } from "@/registry/retana/ui/audio-bars"

export type DeviceKind = "audioinput" | "videoinput"

export type MicSelectProps = {
  kind?: DeviceKind
  value?: string
  onValueChange?: (deviceId: string) => void
  showLevel?: boolean
  className?: string
}

type Permission = "prompt" | "granted" | "denied"

export function MicSelect({ kind = "audioinput", value, onValueChange, showLevel = false, className }: MicSelectProps) {
  const [permission, setPermission] = React.useState<Permission>("prompt")
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([])
  const [level, setLevel] = React.useState(0.2)

  const enumerate = React.useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return
    const list = await navigator.mediaDevices.enumerateDevices()
    setDevices(list.filter((device) => device.kind === kind))
  }, [kind])

  const allow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(kind === "audioinput" ? { audio: true } : { video: true })
      stream.getTracks().forEach((track) => track.stop())
      setPermission("granted")
      await enumerate()
    } catch {
      setPermission("denied")
    }
  }

  React.useEffect(() => {
    const onChange = () => void enumerate()
    navigator.mediaDevices?.addEventListener?.("devicechange", onChange)
    const timer = window.setTimeout(() => void enumerate(), 0)
    return () => {
      window.clearTimeout(timer)
      navigator.mediaDevices?.removeEventListener?.("devicechange", onChange)
    }
  }, [enumerate])

  const noun = kind === "videoinput" ? "camera" : "microphone"
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      {permission === "denied" ? <p className="text-sm text-destructive">Allow the {noun} in the browser settings, then reload.</p> : null}
      {permission === "prompt" && devices.every((device) => !device.label) ? (
        <Button type="button" variant="outline" onClick={() => void allow()}>
          Allow {noun}
        </Button>
      ) : null}
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger aria-label={kind === "videoinput" ? "Camera" : "Microphone"} className="w-full min-w-0">
            <SelectValue placeholder={`Choose a ${noun}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {devices.map((device, index) => (
                <SelectItem key={device.deviceId || index} value={device.deviceId || `device-${index}`}>
                  {device.label || `${noun[0].toUpperCase()}${noun.slice(1)} ${index + 1}`}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {showLevel ? <AudioBars levels={[level, level * 0.8, level * 0.5]} label="Input level" /> : null}
      </div>
      <button type="button" className="sr-only" onClick={() => setLevel((current) => (current > 0.8 ? 0.2 : current + 0.2))}>
        Preview level
      </button>
    </div>
  )
}
