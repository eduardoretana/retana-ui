"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type ImageGenerationStatus = "idle" | "generating" | "done" | "error"

export type ImageGenerationProps = {
  status?: ImageGenerationStatus
  /** 0 to 100. */
  progress?: number
  src?: string
  alt?: string
  prompt?: string
  generatingLabel?: string
  errorLabel?: string
  retryLabel?: string
  idleLabel?: string
  onRetry?: () => void
  className?: string
  frameClassName?: string
}

export function ImageGeneration({
  status = "idle",
  progress = 0,
  src,
  alt = "",
  prompt,
  generatingLabel = "Generating",
  errorLabel = "Could not generate the image",
  retryLabel = "Try again",
  idleLabel = "Waiting for a prompt",
  onRetry,
  className,
  frameClassName,
}: ImageGenerationProps) {
  const [loadedSrc, setLoadedSrc] = React.useState<string | null>(null)
  const revealed = status === "done" && Boolean(src) && loadedSrc === src
  const bounded = Math.min(100, Math.max(0, progress))

  return (
    <figure data-slot="image-generation" data-status={status} className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-xl border border-border bg-muted",
          frameClassName,
        )}
      >
        {status === "generating" ? (
          <div className="absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute inset-0 bg-muted motion-safe:animate-pulse" />
            <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-foreground/10 to-transparent motion-safe:animate-[retana-shimmer_1.6s_ease-in-out_infinite]" />
            <style>{"@keyframes retana-shimmer{from{transform:translateX(-120%)}to{transform:translateX(280%)}}"}</style>
          </div>
        ) : null}
        {status === "done" && src ? (
          // The host supplies the generated bitmap. Decorative frames pass alt="".
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onLoad={() => setLoadedSrc(src ?? null)}
            className={cn(
              "size-full object-cover transition-opacity duration-500 motion-reduce:transition-none",
              revealed ? "opacity-100" : "opacity-0",
            )}
          />
        ) : null}
        {status === "idle" ? (
          <div className="grid size-full place-items-center px-6 text-center text-sm text-muted-foreground">{idleLabel}</div>
        ) : null}
        {status === "error" ? (
          <div className="grid size-full place-items-center gap-3 px-6 text-center">
            <p className="text-sm text-destructive">{errorLabel}</p>
            {onRetry ? (
              <Button type="button" size="sm" variant="outline" onClick={onRetry}>
                {retryLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
        {status === "generating" ? (
          <div className="absolute inset-x-3 bottom-3">
            <div
              role="progressbar"
              aria-label={generatingLabel}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(bounded)}
              className="h-1 overflow-hidden rounded-full bg-background/70"
            >
              <div className="h-full rounded-full bg-foreground/80" style={{ width: `${bounded}%` }} />
            </div>
            <p className="mt-1 text-center text-[11px] text-foreground/80">
              {generatingLabel} {Math.round(bounded)}%
            </p>
          </div>
        ) : null}
      </div>
      {prompt ? <figcaption className="text-xs text-muted-foreground">{prompt}</figcaption> : null}
    </figure>
  )
}
