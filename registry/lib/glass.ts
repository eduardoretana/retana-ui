/**
 * RUI-GLASS-001. Glass only on floating chrome.
 * The idea comes from an unlicensed video (https://x.com/i/status/2116193966655934968).
 * Clean-room: no values, assets, or source were copied.
 *
 * The surface is opaque unless backdrop-filter is supported and the reader
 * has not asked for less transparency or less motion. Blur is static and
 * under 20px (backdrop-blur-md is 12px, backdrop-blur-xs is 4px).
 */

const reduced =
  "motion-reduce:!bg-background motion-reduce:!backdrop-blur-none [@media(prefers-reduced-transparency:reduce)]:!bg-background [@media(prefers-reduced-transparency:reduce)]:!backdrop-blur-none"

export const floatingGlass70 = `bg-background supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:backdrop-blur-md ${reduced}`

export const floatingGlass80 = `bg-background supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-md ${reduced}`

export const floatingGlass90 = `bg-background supports-[backdrop-filter]:bg-background/90 supports-[backdrop-filter]:backdrop-blur-md ${reduced}`

export const floatingGlass95 = `bg-background supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-md ${reduced}`

export const floatingScrim = `bg-background supports-[backdrop-filter]:bg-foreground/10 supports-[backdrop-filter]:backdrop-blur-xs ${reduced}`
