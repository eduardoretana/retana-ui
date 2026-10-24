import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/kidneys-3d at 880b7c9. The GLB stays in that
// repository under its own licence; see attribution.source.
export const kidneysModel: OrganModel = {
  name: "Kidneys",
  src: "https://cdn.jsdelivr.net/gh/organui/kidneys-3d@880b7c9cdf9f2272eee7741b01ccb34454adb30c/public/models/kidneys.glb",
  bytes: 380208,
  defaultView: "Anterior",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Posterior",
      direction: [0, 0, -1],
    },
    {
      name: "Patient left",
      direction: [1, 0, 0],
    },
    {
      name: "Patient right",
      direction: [-1, 0, 0],
    },
  ],
  structures: [
    {
      id: "right-kidney",
      label: "Right kidney",
      group: "Kidneys",
      color: "#9f4e45",
      description:
        "The patient’s right kidney is one of the paired organs that filter blood and produce urine. In this source body it sits slightly lower than the left kidney.",
    },
    {
      id: "left-kidney",
      label: "Left kidney",
      group: "Kidneys",
      color: "#b56256",
      description:
        "The patient’s left kidney is shown in its source alignment beside the spine. This surface mesh does not expose cortex, medulla, or the renal pelvis.",
    },
    {
      id: "right-ureter",
      label: "Right ureter",
      group: "Urinary tract",
      color: "#d09b73",
      description:
        "The right ureter is the narrow muscular tube that carries urine from the right kidney toward the bladder. The bladder is outside this release’s represented scope.",
    },
    {
      id: "left-ureter",
      label: "Left ureter",
      group: "Urinary tract",
      color: "#dcad86",
      description:
        "The left ureter descends from the left kidney toward the bladder. Its lower end is truncated here because the bladder is not included in the selected geometry.",
    },
    {
      id: "right-renal-artery",
      label: "Right renal artery",
      group: "Arterial supply",
      color: "#bd514c",
      description:
        "The right renal artery supplies the right kidney. The source concept combines its represented trunk and mapped branches into one selectable scene object.",
    },
    {
      id: "left-renal-artery",
      label: "Left renal artery",
      group: "Arterial supply",
      color: "#cf6960",
      description:
        "The left renal artery supplies the left kidney. Color is illustrative and is used to distinguish the arterial meshes from adjacent surfaces.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International",
    license: "CC BY 4.0",
    licenseUrl: "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html",
    source:
      "https://github.com/organui/kidneys-3d/blob/880b7c9cdf9f2272eee7741b01ccb34454adb30c/public/models/LICENSE.txt",
  },
}

export type KidneysProps = Omit<OrganViewerProps, "model">

export function Kidneys(props: KidneysProps) {
  return <OrganViewer model={kidneysModel} {...props} />
}
