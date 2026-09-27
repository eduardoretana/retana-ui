"use client"

import * as React from "react"
import { Maximize, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type VideoPlayerProps = {
  src: string
  poster?: string
  label?: string
  playLabel?: string
  pauseLabel?: string
  seekLabel?: string
  muteLabel?: string
  unmuteLabel?: string
  volumeLabel?: string
  speedLabel?: string
  fullscreenLabel?: string
  exitFullscreenLabel?: string
  className?: string
}

const RATES = [0.5, 1, 1.25, 1.5, 2]

function clock(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00"
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${minutes}:${rest.toString().padStart(2, "0")}`
}

export function VideoPlayer({
  src,
  poster,
  label = "Video",
  playLabel = "Play",
  pauseLabel = "Pause",
  seekLabel = "Seek",
  muteLabel = "Mute",
  unmuteLabel = "Unmute",
  volumeLabel = "Volume",
  speedLabel = "Playback speed",
  fullscreenLabel = "Fullscreen",
  exitFullscreenLabel = "Exit fullscreen",
  className,
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [muted, setMuted] = React.useState(false)
  const [rate, setRate] = React.useState(1)
  const [fullscreen, setFullscreen] = React.useState(false)

  React.useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  function toggle() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  async function toggleFullscreen() {
    const node = rootRef.current
    if (!node) return
    if (document.fullscreenElement === node) await document.exitFullscreen()
    else await node.requestFullscreen()
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement
    if (target.closest("input, select, textarea")) return
    const video = videoRef.current
    if (!video) return
    if (event.key === " " || event.key === "k") {
      event.preventDefault()
      toggle()
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 5)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      video.currentTime = Math.max(0, video.currentTime - 5)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      const next = Math.min(1, (video.muted ? 0 : video.volume) + 0.05)
      video.muted = false
      video.volume = next
      setMuted(false)
      setVolume(next)
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      const next = Math.max(0, video.volume - 0.05)
      video.volume = next
      setVolume(next)
    } else if (event.key === "m") {
      event.preventDefault()
      video.muted = !video.muted
      setMuted(video.muted)
    } else if (event.key === "f") {
      event.preventDefault()
      void toggleFullscreen()
    }
  }

  return (
    <div
      ref={rootRef}
      data-slot="video-player"
      role="region"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        className="aspect-video w-full bg-muted"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume)
          setMuted(event.currentTarget.muted)
        }}
      />
      <div className="flex flex-wrap items-center gap-2 px-2 py-2">
        <Button type="button" size="icon-sm" variant="ghost" onClick={toggle} aria-label={playing ? pauseLabel : playLabel}>
          {playing ? <Pause /> : <Play />}
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {clock(time)} / {clock(duration)}
        </span>
        <input
          type="range"
          className="h-1 min-w-24 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          aria-label={seekLabel}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (videoRef.current) videoRef.current.currentTime = next
            setTime(next)
          }}
        />
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={muted || volume === 0 ? unmuteLabel : muteLabel}
          onClick={() => {
            const video = videoRef.current
            if (!video) return
            video.muted = !video.muted
            setMuted(video.muted)
          }}
        >
          {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
        </Button>
        <input
          type="range"
          className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          aria-label={volumeLabel}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (videoRef.current) {
              videoRef.current.volume = next
              videoRef.current.muted = next === 0
            }
            setVolume(next)
            setMuted(next === 0)
          }}
        />
        <Button
          type="button"
          size="xs"
          variant="ghost"
          aria-label={speedLabel}
          onClick={() => {
            const index = RATES.indexOf(rate)
            const next = RATES[(index + 1) % RATES.length] ?? 1
            if (videoRef.current) videoRef.current.playbackRate = next
            setRate(next)
          }}
        >
          {rate}×
        </Button>
        <Button type="button" size="icon-sm" variant="ghost" aria-label={fullscreen ? exitFullscreenLabel : fullscreenLabel} onClick={() => void toggleFullscreen()}>
          {fullscreen ? <Minimize2 /> : <Maximize />}
        </Button>
      </div>
    </div>
  )
}
