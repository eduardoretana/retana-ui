"use client"

import * as React from "react"
import { CircleAlertIcon, MinusIcon, PauseIcon, PlayIcon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AmbientLight,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Scene,
  SphereGeometry,
  Spherical,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type Nucleobase = "A" | "C" | "G" | "T"

export type BasePair = {
  index: number
  /** Base on the drawn 5′→3′ strand. */
  base: Nucleobase
  /** Its Watson–Crick partner on the complementary strand. */
  partner: Nucleobase
  hydrogenBonds: 2 | 3
}

export type DnaHelixHandle = {
  zoom: (factor: number) => void
  rotate: (azimuth: number, polar?: number) => void
  reset: () => void
}

export type DnaHelixProps = {
  /** One strand, read 5′ to 3′. Whitespace is ignored; only A, C, G and T are allowed. */
  sequence?: string
  /** Base pair index, from 0 at the 5′ end. */
  selectedIndex?: number | null
  onSelectionChange?: (index: number, pair: BasePair) => void
  /** Spins the helix slowly about its axis until the user pauses it or moves the camera. Off when the user prefers reduced motion. Defaults to true. */
  autoRotate?: boolean
  /** Shows the selectable sequence of both strands below the stage. Defaults to true. */
  strands?: boolean
  /** Shows the rotation, zoom and reset buttons. Defaults to true. */
  controls?: boolean
  label?: string
  className?: string
  ref?: React.Ref<DnaHelixHandle>
}

const COMPLEMENT: Record<Nucleobase, Nucleobase> = {
  A: "T",
  T: "A",
  C: "G",
  G: "C",
}

/** Colours shared with the molecule viewer's nucleotide colouring. */
export const nucleobaseColors: Record<Nucleobase, string> = {
  A: "#e15759",
  T: "#4e79a7",
  G: "#59a14f",
  C: "#edc948",
}

export const nucleobaseNames: Record<Nucleobase, string> = {
  A: "Adenine",
  T: "Thymine",
  G: "Guanine",
  C: "Cytosine",
}

/** Pairs each base of a 5′→3′ strand with its complement. Throws on letters other than A, C, G and T. */
export function dnaBasePairs(sequence: string): BasePair[] {
  const bases = sequence.replace(/\s+/g, "").toUpperCase()
  const invalid = bases.match(/[^ACGT]/)
  if (invalid)
    throw new Error(
      `The sequence may contain only A, C, G and T; it has “${invalid[0]}”.`
    )
  return [...bases].map((letter, index) => {
    const base = letter as Nucleobase
    return {
      index,
      base,
      partner: COMPLEMENT[base],
      hydrogenBonds: base === "G" || base === "C" ? 3 : 2,
    }
  })
}

// B-DNA: 3.38 Å rise and 34.3° twist per base pair (10.5 pairs a turn), with
// phosphates about 9 Å from the axis. The two backbones sit closer on one
// side, which leaves the minor and major grooves.
const RISE = 3.38
const TWIST = (34.3 * Math.PI) / 180
const RADIUS = 9
const MINOR_GROOVE = (140 * Math.PI) / 180
const STAGE_TONE = new Color("#e4e3dc")
const STRAND_COLORS = ["#6b7a8c", "#9a8770"] as const
const UP = new Vector3(0, 1, 0)

// The helix runs along x, from the 5′ end of the drawn strand on the left.
function backbonePoint(index: number, count: number, strand: 0 | 1) {
  const angle = index * TWIST + (strand ? MINOR_GROOVE : 0)
  return new Vector3(
    (index - (count - 1) / 2) * RISE,
    RADIUS * Math.cos(angle),
    RADIUS * Math.sin(angle)
  )
}

function buildHelix(pairs: BasePair[]) {
  const count = pairs.length
  const group = new Group()
  const material = () =>
    new MeshStandardMaterial({ roughness: 0.5, metalness: 0 })
  const strands = ([0, 1] as const).map((strand) => {
    const points = pairs.map(({ index }) => backbonePoint(index, count, strand))
    // A single pair still gets a short backbone stub.
    if (points.length === 1)
      points.push(points[0]!.clone().add(new Vector3(RISE, 0, 0)))
    const curve = new CatmullRomCurve3(points, false, "centripetal")
    const tube = new Mesh(
      new TubeGeometry(curve, Math.max(8, points.length * 8), 0.9, 10),
      material()
    )
    group.add(tube)
    return tube
  })

  const phosphates = new InstancedMesh(
    new SphereGeometry(1.6, 16, 12),
    material(),
    count * 2
  )
  const bases = new InstancedMesh(
    new CylinderGeometry(1, 1, 1, 12),
    material(),
    count * 2
  )
  const matrix = new Matrix4()
  const quaternion = new Quaternion()
  const scale = new Vector3()
  const direction = new Vector3()
  const color = new Color()
  for (const { index } of pairs) {
    const ends = [
      backbonePoint(index, count, 0),
      backbonePoint(index, count, 1),
    ]
    const middle = ends[0]!.clone().add(ends[1]!).multiplyScalar(0.5)
    ends.forEach((end, strand) => {
      const instance = index * 2 + strand
      matrix.makeTranslation(end.x, end.y, end.z)
      phosphates.setMatrixAt(instance, matrix)
      phosphates.setColorAt(instance, color)
      // Each base reaches from its backbone to just short of the pair's
      // centre, so the gap reads as the hydrogen bonds.
      direction.subVectors(middle, end)
      const length = direction.length() - 0.35
      direction.normalize()
      matrix.compose(
        end.clone().addScaledVector(direction, length / 2),
        quaternion.setFromUnitVectors(UP, direction),
        scale.set(0.85, length, 0.85)
      )
      bases.setMatrixAt(instance, matrix)
      bases.setColorAt(instance, color)
    })
  }
  phosphates.computeBoundingSphere()
  bases.computeBoundingSphere()
  group.add(phosphates, bases)

  return {
    group,
    pickable: [bases, phosphates],
    paint(selected: number) {
      const tone = (hex: string, pair: number) => {
        color.set(hex)
        return selected >= 0 && pair !== selected
          ? color.lerp(STAGE_TONE, 0.65)
          : color
      }
      strands.forEach((tube, strand) => {
        const material = tube.material as MeshStandardMaterial
        material.color.set(STRAND_COLORS[strand]!)
        if (selected >= 0) material.color.lerp(STAGE_TONE, 0.65)
      })
      for (const pair of pairs)
        for (const strand of [0, 1] as const) {
          const instance = pair.index * 2 + strand
          phosphates.setColorAt(
            instance,
            tone(STRAND_COLORS[strand]!, pair.index)
          )
          bases.setColorAt(
            instance,
            tone(
              nucleobaseColors[strand ? pair.partner : pair.base],
              pair.index
            )
          )
        }
      phosphates.instanceColor!.needsUpdate = true
      bases.instanceColor!.needsUpdate = true
    },
    dispose() {
      for (const mesh of [...strands, phosphates, bases]) {
        mesh.geometry.dispose()
        ;(mesh.material as MeshStandardMaterial).dispose()
      }
      phosphates.dispose()
      bases.dispose()
    },
  }
}

type Engine = DnaHelixHandle & {
  paint: (selected: number) => void
  spin: (on: boolean) => void
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function Strands({
  pairs,
  selected,
  onSelect,
}: {
  pairs: BasePair[]
  selected: number
  onSelect: (index: number) => void
}) {
  const strip = React.useRef<HTMLDivElement>(null)
  const [focus, setFocus] = React.useState<number | null>(null)
  const stop =
    focus !== null && focus < pairs.length
      ? focus
      : selected >= 0 && selected < pairs.length
        ? selected
        : 0

  // A pair picked on the stage scrolls into view inside the strip only.
  React.useEffect(() => {
    const container = strip.current
    const button = container?.querySelector<HTMLElement>(
      `[data-pair="${selected}"]`
    )
    if (!container || !button) return
    const left = button.offsetLeft - container.offsetLeft
    if (
      left < container.scrollLeft ||
      left + button.offsetWidth > container.scrollLeft + container.clientWidth
    )
      container.scrollLeft = left - container.clientWidth / 2
  }, [selected])

  return (
    <div
      ref={strip}
      role="toolbar"
      aria-label="Base pairs"
      className="flex shrink-0 items-stretch gap-px overflow-x-auto border-t bg-background/60 px-2 py-1.5 font-mono text-xs"
      onKeyDown={(event) => {
        const next: Record<string, number> = {
          ArrowRight: Math.min(pairs.length - 1, stop + 1),
          ArrowLeft: Math.max(0, stop - 1),
          Home: 0,
          End: pairs.length - 1,
        }
        const target = next[event.key]
        if (target === undefined) return
        event.preventDefault()
        setFocus(target)
        strip.current
          ?.querySelector<HTMLElement>(`[data-pair="${target}"]`)
          ?.focus()
      }}
    >
      <span
        aria-hidden="true"
        className="flex flex-col justify-around pr-1 text-muted-foreground"
      >
        <span>5′</span>
        <span>3′</span>
      </span>
      {pairs.map((pair) => (
        <button
          key={pair.index}
          type="button"
          data-pair={pair.index}
          tabIndex={pair.index === stop ? 0 : -1}
          aria-pressed={pair.index === selected}
          aria-label={`Pair ${pair.index + 1}: ${pair.base}–${pair.partner}`}
          onFocus={() => setFocus(pair.index)}
          onClick={() => onSelect(pair.index)}
          className={cn(
            "flex min-w-5 flex-col items-center rounded px-0.5 py-0.5 leading-tight hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring",
            pair.index === selected &&
              "bg-primary text-primary-foreground hover:bg-primary"
          )}
        >
          {[pair.base, pair.partner].map((base, strand) => (
            // The space keeps the bases separate words in the visible label,
            // so voice control matches them against the accessible name.
            <React.Fragment key={strand}>
              {strand > 0 && " "}
              <span className="flex items-center gap-0.5">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: nucleobaseColors[base] }}
                />
                {base}
              </span>
            </React.Fragment>
          ))}
        </button>
      ))}
      <span
        aria-hidden="true"
        className="flex flex-col justify-around pl-1 text-muted-foreground"
      >
        <span>3′</span>
        <span>5′</span>
      </span>
    </div>
  )
}

export function DnaHelix({
  sequence = "ATGCGTACCTGAGCTTAACGGATC",
  selectedIndex = null,
  onSelectionChange,
  autoRotate = true,
  strands = true,
  controls = true,
  label = "Interactive DNA double helix",
  className,
  ref,
}: DnaHelixProps) {
  const host = React.useRef<HTMLDivElement>(null)
  const parsed = React.useMemo(() => {
    try {
      const pairs = dnaBasePairs(sequence)
      return pairs.length ? { pairs } : { error: "The sequence is empty." }
    } catch (reason) {
      return {
        error:
          reason instanceof Error ? reason.message : "The sequence is invalid.",
      }
    }
  }, [sequence])
  const pairs = parsed.pairs ?? null
  const [graphicsFailed, setGraphicsFailed] = React.useState(false)
  const [engine, setEngine] = React.useState<Engine | null>(null)
  const [interacted, setInteracted] = React.useState(false)
  const [paused, setPaused] = React.useState(false)
  const [reducedMotion, setReducedMotion] = React.useState(false)
  const spinning = autoRotate && !paused && !reducedMotion
  const instructions = React.useId()
  const latest = React.useRef({ onSelectionChange, pairs })
  React.useLayoutEffect(() => {
    latest.current = { onSelectionChange, pairs }
  })
  const selected =
    pairs && selectedIndex !== null && selectedIndex < pairs.length
      ? selectedIndex
      : -1
  const select = React.useCallback((index: number) => {
    const pair = latest.current.pairs?.[index]
    if (pair) latest.current.onSelectionChange?.(index, pair)
  }, [])

  React.useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReducedMotion(motion.matches)
    apply()
    motion.addEventListener("change", apply)
    return () => motion.removeEventListener("change", apply)
  }, [])

  React.useEffect(() => {
    const container = host.current
    if (!pairs || !container || graphicsFailed) return
    const canvas = document.createElement("canvas")
    canvas.className = "block size-full touch-none outline-none"
    canvas.setAttribute("aria-hidden", "true")
    container.prepend(canvas)
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      })
    } catch {
      canvas.remove()
      // WebGL is an external system; its failure is reported once per attempt.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGraphicsFailed(true)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const stage = new Scene()
    stage.add(new AmbientLight("#ffffff", 0.8))
    stage.add(new HemisphereLight("#fffcf3", "#a49b8f", 1.4))
    const camera = new PerspectiveCamera(34, 1, 0.5, 5000)
    const lights: [number[], number, string][] = [
      [[-4, 6, 6], 2.4, "#fff5e6"],
      [[5, 1, -4], 1.4, "#e1edff"],
    ]
    for (const [position, intensity, color] of lights) {
      const light = new DirectionalLight(color, intensity)
      light.position.set(position[0]!, position[1]!, position[2]!)
      camera.add(light)
    }
    stage.add(camera)
    const helix = buildHelix(pairs)
    stage.add(helix.group)
    const orbit = new OrbitControls(camera, canvas)
    orbit.enablePan = false
    orbit.rotateSpeed = 0.65
    orbit.zoomSpeed = 0.8
    orbit.enableDamping = !matchMedia("(prefers-reduced-motion: reduce)")
      .matches
    const length = pairs.length * RISE
    orbit.minDistance = RADIUS * 2
    orbit.maxDistance = Math.max(length, RADIUS * 4) * 4

    let dirty = true
    const render = () => (dirty = true)
    let spin = false
    let last = performance.now()
    let frame = 0
    const tick = (now: number) => {
      if (spin) {
        // About one turn every 25 seconds.
        helix.group.rotation.x += Math.min(0.1, (now - last) / 1000) * 0.25
        dirty = true
      }
      last = now
      if (orbit.update() || dirty) {
        renderer.render(stage, camera)
        dirty = false
      }
      frame = requestAnimationFrame(tick)
    }

    const reset = () => {
      orbit.reset()
      orbit.target.set(0, 0, 0)
      const halfV = (camera.fov * Math.PI) / 360
      const tanV = Math.tan(halfV)
      const tanH = tanV * camera.aspect
      const distance =
        Math.max((length / 2 + RADIUS) / tanH, (RADIUS + 2) / tanV) / 0.85 +
        RADIUS
      camera.position.set(0, 0, Math.min(orbit.maxDistance, distance))
      camera.lookAt(0, 0, 0)
      helix.group.rotation.set(0, 0, 0)
      orbit.update()
      render()
    }
    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      render()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()
    camera.aspect = container.clientWidth / Math.max(1, container.clientHeight)
    reset()

    let interacting = false
    const onStart = () => {
      interacting = true
      // Moving the camera stops the spin, as the pause button would.
      setPaused(true)
    }
    const onEnd = () => (interacting = false)
    const onChange = () => {
      if (interacting) setInteracted(true)
      render()
    }
    orbit.addEventListener("start", onStart)
    orbit.addEventListener("end", onEnd)
    orbit.addEventListener("change", onChange)

    const raycaster = new Raycaster()
    const down = new Vector2()
    const onPointerDown = (event: PointerEvent) =>
      down.set(event.clientX, event.clientY)
    const onPointerUp = (event: PointerEvent) => {
      if (down.distanceTo(new Vector2(event.clientX, event.clientY)) > 4) return
      const bounds = canvas.getBoundingClientRect()
      raycaster.setFromCamera(
        new Vector2(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          -((event.clientY - bounds.top) / bounds.height) * 2 + 1
        ),
        camera
      )
      const hit = raycaster.intersectObjects(helix.pickable, false)[0]
      if (hit?.instanceId !== undefined) select(Math.floor(hit.instanceId / 2))
    }
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointerup", onPointerUp)
    const onContextLost = (event: Event) => {
      event.preventDefault()
      setGraphicsFailed(true)
    }
    canvas.addEventListener("webglcontextlost", onContextLost)

    setEngine({
      paint(selected) {
        helix.paint(selected)
        render()
      },
      spin(on) {
        spin = on
        last = performance.now()
      },
      reset,
      zoom(factor) {
        const offset = camera.position.clone().sub(orbit.target)
        offset.setLength(
          Math.min(
            orbit.maxDistance,
            Math.max(orbit.minDistance, offset.length() * factor)
          )
        )
        camera.position.copy(orbit.target).add(offset)
        orbit.update()
        setInteracted(true)
        render()
      },
      rotate(azimuth, polar = 0) {
        const spherical = new Spherical().setFromVector3(
          camera.position.clone().sub(orbit.target)
        )
        spherical.theta += azimuth
        spherical.phi += polar
        spherical.makeSafe()
        camera.position
          .copy(orbit.target)
          .add(new Vector3().setFromSpherical(spherical))
        orbit.update()
        setPaused(true)
        setInteracted(true)
        render()
      },
    })
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      setEngine(null)
      observer.disconnect()
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("webglcontextlost", onContextLost)
      orbit.dispose()
      stage.remove(helix.group)
      helix.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [pairs, graphicsFailed, select])

  React.useEffect(() => {
    engine?.paint(selected)
  }, [engine, selected])

  React.useEffect(() => {
    engine?.spin(spinning)
  }, [engine, spinning])

  React.useImperativeHandle(
    ref,
    () => ({
      zoom: (factor) => engine?.zoom(factor),
      rotate: (azimuth, polar) => engine?.rotate(azimuth, polar),
      reset: () => engine?.reset(),
    }),
    [engine]
  )

  const message = parsed.error
    ? { title: "The sequence can’t be drawn", text: parsed.error, retry: false }
    : graphicsFailed
      ? {
          title: "3D view unavailable",
          text: "WebGL could not start or its connection was interrupted. Try again, or use a browser with hardware acceleration enabled.",
          retry: true,
        }
      : null
  const pair = pairs && selected >= 0 ? pairs[selected]! : null
  const status = pair
    ? `Pair ${pair.index + 1} of ${pairs!.length} · ${nucleobaseNames[pair.base]}–${nucleobaseNames[pair.partner].toLowerCase()} · ${pair.hydrogenBonds} hydrogen bonds`
    : pairs
      ? `${pairs.length} base pair${pairs.length === 1 ? "" : "s"}`
      : ""

  return (
    <div
      className={cn(
        "flex h-96 w-full flex-col overflow-hidden rounded-xl border bg-muted/30 text-sm text-foreground",
        className
      )}
    >
      <div
        ref={host}
        role="region"
        aria-label={label}
        aria-describedby={instructions}
        tabIndex={0}
        className="relative min-h-0 flex-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || !engine) return
          const actions: Record<string, () => void> = {
            ArrowLeft: () => engine.rotate(-0.2),
            ArrowRight: () => engine.rotate(0.2),
            ArrowUp: () => engine.rotate(0, -0.2),
            ArrowDown: () => engine.rotate(0, 0.2),
            "+": () => engine.zoom(0.85),
            "=": () => engine.zoom(0.85),
            "-": () => engine.zoom(1.18),
          }
          const action = actions[event.key]
          if (!action) return
          event.preventDefault()
          action()
        }}
      >
        <p id={instructions} className="sr-only">
          Drag or use the arrow keys to rotate, and scroll, pinch or press plus
          and minus to zoom. Click a base pair to select it, or choose one from
          the strands.
        </p>
        {message && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <Alert className="max-w-sm">
              <CircleAlertIcon
                aria-hidden="true"
              />
              <AlertTitle>{message.title}</AlertTitle>
              <AlertDescription>
                <p>{message.text}</p>
                {message.retry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGraphicsFailed(false)}
                    className="mt-3 text-foreground"
                  >
                    Try again
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
        {engine && controls && (
          <TooltipProvider>
            <div
              role="toolbar"
              aria-label="View controls"
              className="absolute top-2 right-2 flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-sm"
            >
              {autoRotate && !reducedMotion && (
                <ToolbarButton
                  label={paused ? "Resume rotation" : "Pause rotation"}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? (
                    <PlayIcon
                      aria-hidden="true"
                    />
                  ) : (
                    <PauseIcon
                      aria-hidden="true"
                    />
                  )}
                </ToolbarButton>
              )}
              <ToolbarButton label="Zoom in" onClick={() => engine.zoom(0.85)}>
                <PlusIcon
                  aria-hidden="true"
                />
              </ToolbarButton>
              <ToolbarButton label="Zoom out" onClick={() => engine.zoom(1.18)}>
                <MinusIcon
                  aria-hidden="true"
                />
              </ToolbarButton>
              <ToolbarButton label="Reset view" onClick={() => engine.reset()}>
                <RotateCcwIcon
                  aria-hidden="true"
                />
              </ToolbarButton>
            </div>
          </TooltipProvider>
        )}
        {engine && !interacted && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-xs text-muted-foreground"
          >
            Drag to rotate · Scroll or pinch to zoom
          </p>
        )}
        <p
          aria-live="polite"
          className="pointer-events-none absolute right-2 bottom-1.5 left-2 truncate text-[11px] text-muted-foreground"
        >
          {status}
        </p>
      </div>
      {strands && pairs && (
        <Strands pairs={pairs} selected={selected} onSelect={select} />
      )}
    </div>
  )
}
