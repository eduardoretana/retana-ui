"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/media-vision/use-webcam/use-webcam.ts

import * as React from "react"

export type WebcamErrorKind = "permission" | "hardware" | "unknown"

export type WebcamStatus = "idle" | "starting" | "active" | "error"

export type UseWebcamOptions = {
  facingMode?: "user" | "environment"
  width?: number
  height?: number
  audio?: boolean
  autoStart?: boolean
}

export function useWebcam(options: UseWebcamOptions = {}) {
  const { facingMode = "user", width = 1280, height = 720, audio = false, autoStart = false } = options
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const [status, setStatus] = React.useState<WebcamStatus>("idle")
  const [error, setError] = React.useState<{ kind: WebcamErrorKind; message: string } | null>(null)
  const facing = React.useRef(facingMode)

  const stop = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus("idle")
  }, [])

  const start = React.useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error")
      setError({ kind: "hardware", message: "This browser has no camera API." })
      return
    }
    setStatus("starting")
    setError(null)
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        audio,
        video: { facingMode: facing.current, width, height },
      })
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = next
      setStream(next)
      if (videoRef.current) {
        videoRef.current.srcObject = next
        await videoRef.current.play().catch(() => undefined)
      }
      setStatus("active")
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ""
      const kind: WebcamErrorKind = name === "NotAllowedError" || name === "SecurityError" ? "permission" : name === "NotFoundError" ? "hardware" : "unknown"
      setStatus("error")
      setError({ kind, message: err instanceof Error ? err.message : "The camera could not start." })
    }
  }, [audio, height, width])

  const switchCamera = React.useCallback(async () => {
    facing.current = facing.current === "user" ? "environment" : "user"
    await start()
  }, [start])

  React.useEffect(() => {
    if (!autoStart) {
      return () => {
        streamRef.current?.getTracks().forEach((track) => track.stop())
      }
    }
    const timer = window.setTimeout(() => void start(), 0)
    return () => {
      window.clearTimeout(timer)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [autoStart, start])

  React.useEffect(() => {
    const onChange = () => {
      if (status === "active") void start()
    }
    navigator.mediaDevices?.addEventListener?.("devicechange", onChange)
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", onChange)
  }, [start, status])

  return { videoRef, stream, status, error, start, stop, switchCamera }
}
