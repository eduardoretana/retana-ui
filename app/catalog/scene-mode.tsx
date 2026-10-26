"use client"

import { createContext, useContext, type ReactNode } from "react"

type SceneMode = {
  /** Static thumbnails skip timers and async simulation. */
  interactive: boolean
}

const SceneModeContext = createContext<SceneMode>({ interactive: true })

export function SceneModeProvider({ interactive, children }: { interactive: boolean; children: ReactNode }) {
  return <SceneModeContext.Provider value={{ interactive }}>{children}</SceneModeContext.Provider>
}

export function useSceneMode() {
  return useContext(SceneModeContext)
}
