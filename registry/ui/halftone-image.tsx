"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type HalftoneImageProps = {
  src: string
  alt: string
  /** Approximate number of dots across. */
  columns?: number
  className?: string
}

export function HalftoneImage({ src, alt, columns = 42, className }: HalftoneImageProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const pointer = React.useRef({ x: -1, y: -1, active: false })
  const drawRef = React.useRef<() => void>(() => {})
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const context = canvas.getContext("2d")
    if (!context) return
    let alive = true
    const image = new Image()
    image.decoding = "async"

    const draw = () => {
      if (!alive) return
      const width = wrap.clientWidth
      const height = wrap.clientHeight
      if (width === 0 || height === 0) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)
      const sample = document.createElement("canvas")
      sample.width = columns
      sample.height = Math.max(1, Math.round(columns * (height / width)))
      const sampler = sample.getContext("2d", { willReadFrequently: true })
      if (!sampler) return
      sampler.drawImage(image, 0, 0, sample.width, sample.height)
      const pixels = sampler.getImageData(0, 0, sample.width, sample.height).data
      const color = getComputedStyle(wrap).color
      const gapX = width / sample.width
      const gapY = height / sample.height
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      context.fillStyle = color
      for (let y = 0; y < sample.height; y += 1) {
        for (let x = 0; x < sample.width; x += 1) {
          const offset = (y * sample.width + x) * 4
          const luminance = (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / (3 * 255)
          const cx = (x + 0.5) * gapX
          const cy = (y + 0.5) * gapY
          let influence = 1
          if (!reduced && pointer.current.active) {
            const dx = cx - pointer.current.x
            const dy = cy - pointer.current.y
            const distance = Math.hypot(dx, dy)
            influence = 1 + Math.max(0, 1 - distance / 90) * 1.4
          }
          const radius = Math.max(0.4, (1 - luminance) * Math.min(gapX, gapY) * 0.48 * influence)
          context.beginPath()
          context.arc(cx, cy, radius, 0, Math.PI * 2)
          context.fill()
        }
      }
    }

    drawRef.current = draw
    image.onload = () => {
      setFailed(false)
      draw()
    }
    image.onerror = () => setFailed(true)
    image.src = src
    const resize = new ResizeObserver(() => draw())
    resize.observe(wrap)

    return () => {
      alive = false
      resize.disconnect()
      drawRef.current = () => {}
    }
  }, [columns, src])

  return (
    <div
      ref={wrapRef}
      data-slot="halftone-image"
      className={cn("relative aspect-square overflow-hidden rounded-xl border border-border bg-card text-foreground", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        pointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true }
        drawRef.current()
      }}
      onPointerLeave={() => {
        pointer.current = { x: -1, y: -1, active: false }
        drawRef.current()
      }}
    >
      <canvas ref={canvasRef} className="size-full" role="img" aria-label={alt} />
      {failed ? <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">{alt}</p> : null}
    </div>
  )
}
