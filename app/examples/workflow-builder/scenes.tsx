"use client"

import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { WorkflowBuilder, workflowBuilderLabelsEn } from "@/registry/ui/workflow-builder"

import { blockedGraph, emptyGraph, expressionGraph, failedGraph, failedRun, filledGraph, foreignCredentialGraph, invalidGraph, pinnedData, publishedSnapshot, runningRun, workflowCredentials, workflowNodeTypes } from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "canvas", padding: "none" }

function BuilderScene(props: SceneRenderProps & { graph?: typeof filledGraph; error?: string; loading?: boolean; readOnly?: boolean; compact?: boolean; run?: typeof runningRun | null; pinned?: Record<string, unknown>; published?: typeof publishedSnapshot; workspace?: string; selection?: { nodeIds: string[]; edgeIds: string[] }; initialRunTab?: "payload" | "triggers" | "error" | "timeline" | "runs" }) {
  const { locale, log } = props
  return (
    <WorkflowBuilder
      className={props.compact ? "h-[36rem] w-[390px]" : "h-[36rem]"}
      graph={props.graph}
      nodeTypes={workflowNodeTypes(locale)}
      labels={locale === "en" ? workflowBuilderLabelsEn : undefined}
      locale={locale === "en" ? "en" : "es-MX"}
      workspace={props.workspace ?? "marca-norte"}
      credentials={workflowCredentials}
      {...(props.error ? { error: props.error } : {})}
      {...(props.loading ? { loading: true } : {})}
      {...(props.readOnly ? { readOnly: true } : {})}
      {...(props.compact ? { compact: true } : {})}
      {...(props.run ? { run: props.run } : {})}
      {...(props.pinned ? { pinnedData: props.pinned } : {})}
      {...(props.published ? { published: props.published } : {})}
      {...(props.selection ? { selection: props.selection } : {})}
      {...(props.initialRunTab ? { initialRunTab: props.initialRunTab } : {})}
      onGraphChangeRequest={(request) => log(formatSceneCall("onGraphChangeRequest", [request.type]))}
      onPublishRequest={() => log(formatSceneCall("onPublishRequest"))}
      onRollbackRequest={(version) => log(formatSceneCall("onRollbackRequest", [version]))}
      onApprovalRequest={async (request) => {
        log(formatSceneCall("onApprovalRequest", [request.nodeId]))
        return "approve"
      }}
    />
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame, render: (props) => <BuilderScene {...props} graph={filledGraph} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame, render: (props) => <BuilderScene {...props} graph={emptyGraph} /> },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame, render: (props) => <BuilderScene {...props} loading /> },
  { id: "error", label: "Error", labelEn: "Error", frame, render: (props) => <BuilderScene {...props} error={sceneText(props.locale, "No se pudo leer el flujo.", "The workflow could not be read.")} /> },
  { id: "invalid-graph", label: "Grafo inválido", labelEn: "Invalid graph", frame, render: (props) => <BuilderScene {...props} graph={invalidGraph} /> },
  { id: "running", label: "En curso", labelEn: "Running", frame, render: (props) => <BuilderScene {...props} graph={filledGraph} run={runningRun} /> },
  { id: "run-failed", label: "Corrida fallida", labelEn: "Run failed", frame, render: (props) => <BuilderScene {...props} graph={failedGraph} run={failedRun} initialRunTab="timeline" /> },
  { id: "readonly", label: "Solo lectura", labelEn: "Read only", frame, render: (props) => <BuilderScene {...props} graph={filledGraph} readOnly /> },
  { id: "390", label: "390", labelEn: "390", frame: { size: "sm", surface: "canvas", padding: "none" }, render: (props) => <BuilderScene {...props} graph={filledGraph} compact selection={{ nodeIds: ["respuesta"], edgeIds: [] }} /> },
  { id: "expression", label: "Expresión", labelEn: "Expression", frame, render: (props) => <BuilderScene {...props} graph={expressionGraph} selection={{ nodeIds: ["respuesta"], edgeIds: [] }} /> },
  { id: "pinned", label: "Fijado", labelEn: "Pinned", frame, render: (props) => <BuilderScene {...props} graph={filledGraph} pinned={pinnedData} selection={{ nodeIds: ["contacto"], edgeIds: [] }} run={runningRun} /> },
  { id: "publish-blocked", label: "Publicación bloqueada", labelEn: "Publish blocked", frame, render: (props) => <BuilderScene {...props} graph={blockedGraph} /> },
  { id: "diff", label: "Diferencias", labelEn: "Diff", frame, render: (props) => <BuilderScene {...props} graph={filledGraph} published={publishedSnapshot} /> },
  { id: "foreign-credential", label: "Otra marca", labelEn: "Other brand", frame, render: (props) => <BuilderScene {...props} graph={foreignCredentialGraph} /> },
]
