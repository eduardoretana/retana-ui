"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { MotionConfig } from "motion/react"

import { SceneModeProvider } from "@/app/catalog/scene-mode"
import { scenePaddingClass, sceneSizePx, sceneSurfaceClass, type Scene } from "@/app/catalog/scene-types"
import { cn } from "@/lib/utils"

const noop = () => {}

/**
 * Static catalog thumbnail. Scales one scene into a fixed height,
 * drops motion, and ignores pointer and keyboard input.
 */
export function ScenePreview({ scenes, hero = "filled" }: { scenes: readonly Scene[]; hero?: string }) {
  const scene = scenes.find((item) => item.id === hero) ?? scenes[0]
  const frameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const frame = frameRef.current
    const content = contentRef.current
    if (!frame || !content || !scene) return
    const fit = () => {
      const naturalWidth = content.offsetWidth || 1
      const naturalHeight = content.offsetHeight || 1
      const next = Math.min(1, (frame.clientWidth - 12) / naturalWidth, (frame.clientHeight - 12) / naturalHeight)
      setScale(Number.isFinite(next) && next > 0 ? next : 1)
      setHeight(naturalHeight)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(frame)
    observer.observe(content)
    return () => observer.disconnect()
  }, [scene])

  if (!scene) return null
  const width = sceneSizePx[scene.frame.size]
  const Render = scene.render

  return (
    <div
      ref={frameRef}
      aria-hidden="true"
      inert
      data-plp-preview={scene.id}
      className={cn("flex h-44 w-full items-center justify-center overflow-hidden", sceneSurfaceClass[scene.frame.surface])}
    >
      <div style={{ width: width * scale, height: height * scale }}>
        <div
          ref={contentRef}
          style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}
          className={scenePaddingClass[scene.frame.padding]}
        >
          <SceneModeProvider interactive={false}>
            <MotionConfig reducedMotion="always">
              <Render locale="es" log={noop} />
            </MotionConfig>
          </SceneModeProvider>
        </div>
      </div>
    </div>
  )
}
