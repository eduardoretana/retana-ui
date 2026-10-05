"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/audio/audio-scrub-player/audio-scrub-player.tsx

import * as React from "react"
import { Download, Pause, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type AudioPlayerHandle = {
  play: () => void
  pause: () => void
  seek: (seconds: number) => void
}

export type AudioPlayerProps = {
  src?: string
  blob?: Blob
  peaks?: number[]
  /** Used when the file has no duration yet, so the waveform can still be scrubbed. */
  duration?: number
  onTimeUpdate?: (seconds: number) => void
  downloadName?: string
  className?: string
  classNames?: { root?: string; track?: string }
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2]

export function useObjectUrl(blob?: Blob) {
  const url = React.useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob])
  React.useEffect(() => {
    if (!url) return
    return () => URL.revokeObjectURL(url)
  }, [url])
  return url
}

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const total = Math.floor(seconds)
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${minutes}:${rest.toString().padStart(2, "0")}`
}

export const AudioPlayer = React.forwardRef<AudioPlayerHandle, AudioPlayerProps>(function AudioPlayer(
  { src, blob, peaks, duration: durationHint = 0, onTimeUpdate, downloadName = "audio", className, classNames },
  ref,
) {
  const objectUrl = useObjectUrl(blob)
  const source = src ?? objectUrl
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [mediaDuration, setMediaDuration] = React.useState(0)
  const [speed, setSpeed] = React.useState(1)
  const duration = mediaDuration > 0 ? mediaDuration : durationHint

  React.useImperativeHandle(ref, () => ({
    play: () => void audioRef.current?.play(),
    pause: () => audioRef.current?.pause(),
    seek: (seconds: number) => {
      const audio = audioRef.current
      if (!audio) return
      const next = Math.min(Math.max(0, seconds), duration || seconds)
      if (audio.duration > 0) audio.currentTime = next
      setTime(next)
      onTimeUpdate?.(next)
    },
  }))

  const seek = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    const next = Math.min(Math.max(0, seconds), duration || seconds)
    if (audio.duration > 0) audio.currentTime = next
    setTime(next)
    onTimeUpdate?.(next)
  }

  return (
    <div
      className={cn("flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2", className, classNames?.root)}
      onKeyDown={(event) => {
        if (event.key === " " && event.target === event.currentTarget) {
          event.preventDefault()
          if (playing) audioRef.current?.pause()
          else void audioRef.current?.play()
        }
      }}
      tabIndex={0}
    >
      <audio
        ref={audioRef}
        src={source}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          if (!(event.currentTarget.duration > 0)) return
          setTime(event.currentTarget.currentTime)
          onTimeUpdate?.(event.currentTarget.currentTime)
        }}
        onLoadedMetadata={(event) => {
          const next = event.currentTarget.duration
          if (next > 0) setMediaDuration(next)
        }}
      />
      <Button type="button" size="icon-sm" variant="outline" aria-label={playing ? "Pause" : "Play"} onClick={() => (playing ? audioRef.current?.pause() : void audioRef.current?.play())}>
        {playing ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
      </Button>
      <span className="w-10 font-mono text-xs tabular-nums">{clock(time)}</span>
      <div
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration || 0)}
        aria-valuenow={Math.round(time)}
        aria-valuetext={`${clock(time)} of ${clock(duration)}`}
        aria-label="Seek"
        className={cn("relative h-8 min-w-24 flex-1", classNames?.track)}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 15 : 5
          if (event.key === "ArrowRight") seek(time + step)
          if (event.key === "ArrowLeft") seek(time - step)
          if (event.key === "Home") seek(0)
          if (event.key === "End") seek(duration)
        }}
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const ratio = (event.clientX - rect.left) / rect.width
          seek(ratio * (duration || 0))
        }}
      >
        <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
        {peaks ? (
          <span className="absolute inset-x-0 top-1 flex h-6 items-end gap-px">
            {peaks.map((peak, index) => (
              <span key={index} className="flex-1 rounded-sm bg-muted-foreground/40" style={{ height: `${Math.max(8, peak * 100)}%` }} />
            ))}
          </span>
        ) : null}
        <span className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-primary" style={{ width: duration ? `${(time / duration) * 100}%` : "0%" }} />
      </div>
      <span className="w-10 font-mono text-xs text-muted-foreground tabular-nums">{clock(duration)}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" size="sm" variant="ghost" aria-label="Playback speed">
            {speed}×
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {SPEEDS.map((item) => (
            <DropdownMenuItem
              key={item}
              onSelect={() => {
                setSpeed(item)
                if (audioRef.current) audioRef.current.playbackRate = item
              }}
            >
              {item}×
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {source ? (
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Download audio" asChild>
          <a href={source} download={downloadName}>
            <Download data-icon="inline-start" />
          </a>
        </Button>
      ) : null}
    </div>
  )
})
