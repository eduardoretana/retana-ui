"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/audio/voice-button/voice-button.tsx

import * as React from "react"
import { Loader2, Mic } from "lucide-react"

import { cn } from "@/lib/utils"

export type PushToTalkState = "idle" | "recording" | "processing" | "success" | "error"

export type PushToTalkProps = {
  state?: PushToTalkState
  defaultState?: PushToTalkState
  onStateChange?: (state: PushToTalkState) => void
  onStart?: () => void
  onStop?: (blob?: Blob) => void
  onCancel?: () => void
  volume?: number
  mode?: "hold" | "toggle"
  error?: string
  labels?: Partial<Record<PushToTalkState, string>>
  className?: string
}

const DEFAULT_LABELS: Record<PushToTalkState, string> = {
  idle: "Hold to talk",
  recording: "Recording… release to send",
  processing: "Transcribing…",
  success: "Done",
  error: "Try again",
}

export function useRecorder() {
  const recorder = React.useRef<MediaRecorder | null>(null)
  const chunks = React.useRef<Blob[]>([])
  const stream = React.useRef<MediaStream | null>(null)

  const start = React.useCallback(async () => {
    const media = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.current = media
    chunks.current = []
    const mediaRecorder = new MediaRecorder(media)
    recorder.current = mediaRecorder
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data)
    }
    mediaRecorder.start()
  }, [])

  const stop = React.useCallback(async () => {
    const mediaRecorder = recorder.current
    const blob = await new Promise<Blob | undefined>((resolve) => {
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        resolve(undefined)
        return
      }
      mediaRecorder.onstop = () => resolve(new Blob(chunks.current, { type: mediaRecorder.mimeType || "audio/webm" }))
      mediaRecorder.stop()
    })
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
    recorder.current = null
    return blob
  }, [])

  React.useEffect(() => {
    return () => {
      stream.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return { start, stop }
}

export function PushToTalk({
  state: stateProp,
  defaultState = "idle",
  onStateChange,
  onStart,
  onStop,
  onCancel,
  volume = 0,
  mode = "hold",
  error,
  labels,
  className,
}: PushToTalkProps) {
  const [internal, setInternal] = React.useState(defaultState)
  const state = stateProp ?? internal
  const [elapsed, setElapsed] = React.useState(0)
  const origin = React.useRef<{ x: number; y: number } | null>(null)
  const copy = { ...DEFAULT_LABELS, ...labels }
  const setState = (next: PushToTalkState) => {
    if (stateProp === undefined) setInternal(next)
    onStateChange?.(next)
  }

  React.useEffect(() => {
    if (state !== "recording") return
    const started = Date.now()
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 250)
    return () => window.clearInterval(timer)
  }, [state])

  const begin = () => {
    if (state === "processing") return
    setState("recording")
    setElapsed(0)
    onStart?.()
  }

  const finish = () => {
    if (state !== "recording") return
    setState("processing")
    onStop?.()
  }

  const cancel = () => {
    if (state !== "recording") return
    setState("idle")
    onCancel?.()
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <button
        type="button"
        aria-pressed={state === "recording"}
        aria-label={copy[state]}
        disabled={state === "processing"}
        className="relative inline-flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
        onPointerDown={(event) => {
          if (mode === "toggle") return
          origin.current = { x: event.clientX, y: event.clientY }
          event.currentTarget.setPointerCapture(event.pointerId)
          begin()
        }}
        onPointerUp={() => {
          if (mode === "toggle") return
          finish()
        }}
        onPointerMove={(event) => {
          if (mode === "toggle" || !origin.current || state !== "recording") return
          const distance = Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y)
          if (distance > 40) cancel()
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            cancel()
            return
          }
          if (event.repeat) return
          if (mode === "toggle" && (event.key === " " || event.key === "Enter")) {
            event.preventDefault()
            if (state === "recording") finish()
            else begin()
            return
          }
          if ((event.key === " " || event.key === "Enter") && state !== "recording") {
            event.preventDefault()
            begin()
          }
        }}
        onKeyUp={(event) => {
          if (mode === "toggle") return
          if (event.key === " " || event.key === "Enter") finish()
        }}
        onClick={() => {
          if (mode !== "toggle") return
          if (state === "recording") finish()
          else begin()
        }}
      >
        {state === "recording" ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary/30 motion-reduce:transition-none"
            style={{ transform: `scale(${1.15 + Math.min(1, Math.max(0, volume)) * 0.45})` }}
          />
        ) : null}
        {state === "processing" ? <Loader2 className="size-5 animate-spin motion-reduce:animate-none" /> : <Mic className="relative size-5" />}
      </button>
      <p className="text-center text-xs text-muted-foreground" aria-live="polite">
        {state === "recording" ? `${copy.recording} ${elapsed}s` : error && state === "error" ? error : copy[state]}
      </p>
    </div>
  )
}
