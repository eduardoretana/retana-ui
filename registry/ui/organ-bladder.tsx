import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/bladder-3d at 36674f5. The GLB stays in that
// repository under its own licence; see attribution.source.
export const bladderModel: OrganModel = {
  name: "Bladder",
  src: "https://cdn.jsdelivr.net/gh/organui/bladder-3d@36674f5d09ba1c9c58a3f76c944705c23ee91375/public/models/bladder.glb",
  bytes: 1817148,
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
      name: "Left lateral",
      direction: [1, 0, 0],
    },
  ],
  structures: [
    {
      id: "urinary-bladder",
      label: "Urinary bladder",
      group: "Urinary tract",
      tone: "chart-1", shade: 0.13,
      description:
        "A hollow, balloon-shaped muscular organ in the pelvis that stores urine until it is released.",
    },
    {
      id: "right-ureter",
      label: "Right ureter",
      group: "Urinary tract",
      tone: "chart-2", shade: 0.16,
      description:
        "A narrow muscular tube that carries urine from the right kidney down to the bladder.",
    },
    {
      id: "left-ureter",
      label: "Left ureter",
      group: "Urinary tract",
      tone: "chart-2", shade: 0.18,
      description:
        "A narrow muscular tube that carries urine from the left kidney down to the bladder.",
    },
    {
      id: "urethra",
      label: "Urethra",
      group: "Urinary tract",
      tone: "chart-1", shade: 0.09,
      description:
        "The tube that lets urine leave the body from the bottom of the bladder.",
    },
    {
      id: "prostate",
      label: "Prostate",
      group: "Reproductive organs",
      tone: "muted-foreground", shade: 0.07,
      description:
        "A walnut-sized gland that sits just below the bladder and surrounds the first part of the urethra.",
    },
    {
      id: "right-seminal-vesicle",
      label: "Right seminal vesicle",
      group: "Reproductive organs",
      tone: "muted-foreground", shade: 0.12,
      description:
        "A small gland behind the bladder that adds fluid to semen. It lies close to the bladder’s back wall.",
    },
    {
      id: "left-seminal-vesicle",
      label: "Left seminal vesicle",
      group: "Reproductive organs",
      tone: "muted-foreground", shade: 0.15,
      description:
        "A small gland behind the bladder that adds fluid to semen. It lies close to the bladder’s back wall.",
    },
    {
      id: "right-pubococcygeus",
      label: "Right pubococcygeus",
      group: "Pelvic floor",
      tone: "chart-1", shade: 0.03,
      description:
        "Part of the pelvic floor muscles, which support the bladder and help hold urine in until it is released.",
    },
    {
      id: "left-pubococcygeus",
      label: "Left pubococcygeus",
      group: "Pelvic floor",
      tone: "chart-1", shade: 0.05,
      description:
        "Part of the pelvic floor muscles, which support the bladder and help hold urine in until it is released.",
    },
    {
      id: "right-puborectalis",
      label: "Right puborectalis",
      group: "Pelvic floor",
      tone: "chart-1", shade: -0.01,
      description:
        "Part of the pelvic floor muscles. It forms a sling that loops behind the lower rectum.",
    },
    {
      id: "left-puborectalis",
      label: "Left puborectalis",
      group: "Pelvic floor",
      tone: "chart-1", shade: 0.02,
      description:
        "Part of the pelvic floor muscles. It forms a sling that loops behind the lower rectum.",
    },
    {
      id: "rectum",
      label: "Rectum",
      group: "Neighbouring organs",
      tone: "muted-foreground", shade: 0.06,
      description:
        "The last part of the large intestine, which stores stool. It lies behind the bladder and prostate.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/bladder-3d/blob/36674f5d09ba1c9c58a3f76c944705c23ee91375/public/models/ATTRIBUTION.md",
  },
}

export type BladderProps = Omit<OrganViewerProps, "model">

export function Bladder(props: BladderProps) {
  return <OrganViewer model={bladderModel} {...props} />
}
