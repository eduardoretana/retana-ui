"use client"

import * as React from "react"
import { Dialog } from "radix-ui"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type LightboxItem = {
  src: string
  alt: string
  caption?: string
}

export type LightboxProps = {
  items: readonly LightboxItem[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  closeLabel?: string
  previousLabel?: string
  nextLabel?: string
  zoomInLabel?: string
  zoomOutLabel?: string
  className?: string
}

export function Lightbox({
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  index,
  defaultIndex = 0,
  onIndexChange,
  closeLabel = "Close",
  previousLabel = "Previous",
  nextLabel = "Next",
  zoomInLabel = "Zoom in",
  zoomOutLabel = "Zoom out",
  className,
}: LightboxProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(defaultIndex)
  const [zoom, setZoom] = React.useState(1)
  const isOpen = open ?? uncontrolledOpen
  const current = index ?? uncontrolledIndex
  const item = items[current]

  function setOpen(next: boolean) {
    if (open === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
    if (!next) setZoom(1)
  }

  function setIndex(next: number) {
    const bounded = (next + items.length) % Math.max(items.length, 1)
    if (index === undefined) setUncontrolledIndex(bounded)
    onIndexChange?.(bounded)
    setZoom(1)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      setIndex(current + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      setIndex(current - 1)
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault()
      setZoom((value) => Math.min(4, value + 0.25))
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault()
      setZoom((value) => Math.max(1, value - 0.25))
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content
          data-slot="lightbox"
          aria-describedby={undefined}
          onKeyDown={onKeyDown}
          className={cn(
            "fixed inset-0 z-50 flex flex-col outline-none",
            className,
          )}
        >
          <Dialog.Title className="sr-only">{item?.alt ?? closeLabel}</Dialog.Title>
          <div className="flex items-center justify-end gap-1 p-3">
            <Button type="button" size="icon-sm" variant="secondary" aria-label={zoomOutLabel} onClick={() => setZoom((value) => Math.max(1, value - 0.25))}>
              <ZoomOut />
            </Button>
            <Button type="button" size="icon-sm" variant="secondary" aria-label={zoomInLabel} onClick={() => setZoom((value) => Math.min(4, value + 0.25))}>
              <ZoomIn />
            </Button>
            <Dialog.Close asChild>
              <Button type="button" size="icon-sm" variant="secondary" aria-label={closeLabel}>
                <X />
              </Button>
            </Dialog.Close>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-14">
            {items.length > 1 ? (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute left-3"
                aria-label={previousLabel}
                onClick={() => setIndex(current - 1)}
              >
                <ChevronLeft />
              </Button>
            ) : null}
            {item ? (
              <figure className="flex max-h-full max-w-full flex-col items-center gap-3">
                {/* Host-provided gallery bitmap. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  className="max-h-[70vh] max-w-full rounded-lg object-contain transition-transform duration-200 motion-reduce:transition-none"
                  style={{ transform: `scale(${zoom})` }}
                  draggable={false}
                />
                {item.caption ? <figcaption className="text-sm text-muted-foreground">{item.caption}</figcaption> : null}
              </figure>
            ) : null}
            {items.length > 1 ? (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-3"
                aria-label={nextLabel}
                onClick={() => setIndex(current + 1)}
              >
                <ChevronRight />
              </Button>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function LightboxGallery({
  items,
  className,
}: {
  items: readonly LightboxItem[]
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [index, setIndex] = React.useState(0)

  return (
    <div className={className}>
      <ul className="grid grid-cols-3 gap-2">
        {items.map((item, itemIndex) => (
          <li key={item.src}>
            <button
              type="button"
              className="block w-full overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                setIndex(itemIndex)
                setOpen(true)
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.alt} className="aspect-square w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} />
    </div>
  )
}
