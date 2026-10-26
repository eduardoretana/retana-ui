"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useSceneMode } from "@/app/catalog/scene-mode"

export type SceneCallOptions = {
  /** Wait before the call settles. Ignored on a static thumbnail. */
  delay?: number
  /** Roll the optimistic change back. */
  fail?: boolean
  /** Host-only transitions. The piece did not fire a callback. */
  silent?: boolean
}

export type SceneSim<T> = {
  state: T
  pending: string | null
  failed: boolean
  /** Log `name`, apply `update` immediately. For checkboxes and other sync props. */
  patch: (name: string, update: (current: T) => T) => void
  /**
   * Log `name`, apply `optimistic`, wait, then commit or roll back to the previous state.
   * A newer call or a reset cancels the in-flight one.
   */
  call: (
    name: string,
    optimistic: (current: T) => T,
    commit?: (current: T) => T | Promise<T>,
    options?: SceneCallOptions,
  ) => Promise<boolean>
  reset: () => void
}

const DEFAULT_DELAY = 700

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function useSceneSim<T>(initial: T, log?: (line: string) => void): SceneSim<T> {
  const mode = useSceneMode()
  const initialRef = useRef(initial)
  const [state, setState] = useState(initial)
  const stateRef = useRef(state)
  const [pending, setPending] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const generation = useRef(0)
  const logRef = useRef(log)

  useEffect(() => {
    logRef.current = log
  }, [log])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const patch = useCallback((name: string, update: (current: T) => T) => {
    logRef.current?.(name)
    const next = update(stateRef.current)
    stateRef.current = next
    setState(next)
  }, [])

  const call = useCallback(
    async (
      name: string,
      optimistic: (current: T) => T,
      commit?: (current: T) => T | Promise<T>,
      options?: SceneCallOptions,
    ) => {
      if (!options?.silent) logRef.current?.(name)
      if (!mode.interactive) return false
      const id = ++generation.current
      const previous = stateRef.current
      const next = optimistic(previous)
      stateRef.current = next
      setFailed(false)
      setPending(name)
      setState(next)
      try {
        await wait(options?.delay ?? DEFAULT_DELAY)
        if (generation.current !== id) return false
        if (options?.fail) {
          stateRef.current = previous
          setState(previous)
          setFailed(true)
          return false
        }
        const settled = commit ? await commit(next) : next
        if (generation.current !== id) return false
        stateRef.current = settled
        setState(settled)
        setFailed(false)
        return true
      } catch {
        if (generation.current !== id) return false
        stateRef.current = previous
        setState(previous)
        setFailed(true)
        return false
      } finally {
        if (generation.current === id) setPending(null)
      }
    },
    [mode.interactive],
  )

  const reset = useCallback(() => {
    generation.current += 1
    const snapshot = initialRef.current
    stateRef.current = snapshot
    setState(snapshot)
    setPending(null)
    setFailed(false)
  }, [])

  return { state, pending, failed, patch, call, reset }
}
