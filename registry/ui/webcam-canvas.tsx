"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/media-vision/video-canvas/video-canvas.tsx

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useWebcam } from "@/registry/retana/hooks/use-webcam"

export type WebcamCanvasProps = {
  facingMode?: "user" | "environment"
  aspectRatio?: number
  mirror?: boolean
  onFrame?: (context: CanvasRenderingContext2D, video: HTMLVideoElement) => void
  showFps?: boolean
  className?: string
}

export function WebcamCanvas({ facingMode = "user", aspectRatio = 16 / 9, mirror = true, onFrame, showFps = false, className }: WebcamCanvasProps) {
  const { videoRef, status, error, start, stop } = useWebcam({ facingMode, autoStart: false })
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [fps, setFps] = React.useState(0)

  React.useEffect(() => {
    if (status !== "active") return
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let frame = 0
    let stopped = false
    let frames = 0
    let last = performance.now()
    const hidden = { current: false }
    const observer = new IntersectionObserver((entries) => {
      hidden.current = entries.every((entry) => !entry.isIntersecting)
    })
    observer.observe(canvas)

    const draw = (now: number) => {
      if (stopped) return
      if (!hidden.current && video.readyState >= 2) {
        canvas.width = video.videoWidth || canvas.clientWidth
        canvas.height = video.videoHeight || canvas.clientHeight
        ctx.save()
        if (mirror) {
          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()
        onFrame?.(ctx, video)
        frames += 1
        if (now - last > 1000) {
          setFps(frames)
          frames = 0
          last = now
        }
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [mirror, onFrame, status, videoRef])

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative overflow-hidden rounded-lg bg-muted" style={{ aspectRatio }}>
        <video ref={videoRef} className="sr-only" muted playsInline />
        <canvas ref={canvasRef} className="size-full" aria-label="Camera preview" />
        {showFps && status === "active" ? <span className="absolute top-2 right-2 rounded-md bg-background/80 px-1.5 text-xs tabular-nums">{fps} fps</span> : null}
        {status !== "active" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <p className="text-sm text-muted-foreground">{error?.message ?? "Camera is off."}</p>
            <Button type="button" size="sm" onClick={() => void (status === "idle" || status === "error" ? start() : stop())}>
              {status === "starting" ? "Starting…" : "Start"}
            </Button>
          </div>
        ) : (
          <Button type="button" size="sm" variant="outline" className="absolute bottom-2 left-2" onClick={stop}>
            Stop
          </Button>
        )}
      </div>
    </div>
  )
}
