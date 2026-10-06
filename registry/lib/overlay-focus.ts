"use client"

import * as React from "react"

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

export function focusableElements(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1 && !element.closest("[hidden]"),
  )
}

/** First control that is not a dismiss button, then the dismiss button, then the panel. */
function initialFocusTarget(node: HTMLElement) {
  const items = focusableElements(node)
  const content = items.find((element) => element.dataset.overlayClose === undefined)
  return content ?? items[0] ?? node
}

/**
 * Moves focus into an overlay, restores it on close, and closes on Escape.
 * `trap` cycles Tab inside the panel (modal dialogs).
 */
export function useOverlayFocus(
  open: boolean,
  panelRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  trap: boolean,
) {
  const onCloseRef = React.useRef(onClose)
  React.useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  React.useEffect(() => {
    if (!open) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const node = panelRef.current
    if (node) initialFocusTarget(node).focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (!trap || event.key !== "Tab" || !node) return
      const items = focusableElements(node)
      if (!items.length) {
        event.preventDefault()
        node.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === node)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      previous?.focus()
    }
  }, [open, panelRef, trap])
}
