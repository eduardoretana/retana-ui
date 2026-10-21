import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/eye-3d at 99f74f1. The GLB stays in that
// repository under its own licence; see attribution.source.
export const eyeModel: OrganModel = {
  name: "Eye",
  src: "https://cdn.jsdelivr.net/gh/organui/eye-3d@99f74f1c096ae2813dd18e1ecb2c9cbbd701c530/public/models/eye.glb",
  bytes: 3947432,
  defaultView: "Anterior",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Lateral",
      direction: [-1, 0, 0],
    },
    {
      name: "Superior",
      direction: [0, 1, 0.08],
    },
  ],
  structures: [
    {
      id: "cornea",
      label: "Cornea",
      group: "Wall of the eyeball",
      tone: "chart-4", shade: 0.19,
      description:
        "The clear, curved front window of the eye. It lets light in and does most of the focusing.",
    },
    {
      id: "sclera",
      label: "Sclera",
      group: "Wall of the eyeball",
      tone: "chart-2", shade: 0.29,
      description:
        "The tough white outer coat of the eyeball. It protects the eye and anchors the eye muscles.",
    },
    {
      id: "choroid",
      label: "Choroid",
      group: "Wall of the eyeball",
      tone: "chart-1", shade: -0.01,
      description:
        "A layer rich in blood vessels between the sclera and the retina that nourishes the outer retina.",
    },
    {
      id: "retina",
      label: "Retina",
      group: "Wall of the eyeball",
      tone: "chart-1", shade: 0.13,
      description:
        "The light-sensitive lining at the back of the eye. It turns light into signals sent along the optic nerve.",
    },
    {
      id: "iris",
      label: "Iris",
      group: "Wall of the eyeball",
      tone: "muted-foreground", shade: -0.0,
      description:
        "The coloured ring behind the cornea. Its muscles change the size of the pupil to control how much light enters.",
    },
    {
      id: "anterior-chamber",
      label: "Anterior chamber",
      group: "Inside the eyeball",
      tone: "chart-4", shade: 0.23,
      description:
        "The fluid-filled space between the cornea and the iris. Its clear fluid, the aqueous humour, keeps the eye’s shape.",
    },
    {
      id: "lens",
      label: "Lens",
      group: "Inside the eyeball",
      tone: "chart-2", shade: 0.18,
      description:
        "A clear, flexible structure behind the iris that fine-tunes focus for near and far objects.",
    },
    {
      id: "suspensory-ligament",
      label: "Suspensory ligament of lens",
      group: "Inside the eyeball",
      tone: "chart-2", shade: 0.13,
      description:
        "Fine fibres that hold the lens in place. Changes in their tension let the lens change shape to focus.",
    },
    {
      id: "vitreous-body",
      label: "Vitreous body",
      group: "Inside the eyeball",
      tone: "chart-3", shade: 0.26,
      description:
        "The clear gel that fills the large space behind the lens and helps hold the eye’s shape.",
    },
    {
      id: "superior-rectus",
      label: "Superior rectus",
      group: "Eye muscles",
      tone: "chart-1", shade: 0.03,
      description:
        "One of the six muscles that move the eye. It mainly turns the eye upward.",
    },
    {
      id: "inferior-rectus",
      label: "Inferior rectus",
      group: "Eye muscles",
      tone: "chart-1", shade: 0.0,
      description:
        "One of the six muscles that move the eye. It mainly turns the eye downward.",
    },
    {
      id: "medial-rectus",
      label: "Medial rectus",
      group: "Eye muscles",
      tone: "chart-1", shade: 0.05,
      description:
        "One of the six muscles that move the eye. It turns the eye inward, toward the nose.",
    },
    {
      id: "lateral-rectus",
      label: "Lateral rectus",
      group: "Eye muscles",
      tone: "chart-1", shade: 0.07,
      description:
        "One of the six muscles that move the eye. It turns the eye outward, away from the nose.",
    },
    {
      id: "superior-oblique",
      label: "Superior oblique",
      group: "Eye muscles",
      tone: "chart-1", shade: 0.09,
      description:
        "An eye muscle whose tendon passes through a small pulley, the trochlea, before reaching the eyeball. It mainly rotates the eye and helps it look down and out.",
    },
    {
      id: "inferior-oblique",
      label: "Inferior oblique",
      group: "Eye muscles",
      tone: "chart-1", shade: 0.03,
      description:
        "An eye muscle that wraps under the eyeball from the front. It mainly rotates the eye and helps it look up and out.",
    },
    {
      id: "levator-palpebrae",
      label: "Levator palpebrae superioris",
      group: "Eye muscles",
      tone: "chart-1", shade: 0.12,
      description:
        "The muscle that raises the upper eyelid. It does not move the eyeball.",
    },
    {
      id: "optic-nerve",
      label: "Optic nerve",
      group: "Nerve and eyelid",
      tone: "chart-2", shade: 0.13,
      description: "Carries visual signals from the retina to the brain.",
    },
    {
      id: "trochlea",
      label: "Trochlea",
      group: "Nerve and eyelid",
      tone: "chart-2", shade: 0.24,
      description:
        "A small loop of cartilage that acts as a pulley for the tendon of the superior oblique muscle.",
    },
    {
      id: "lacrimal-gland",
      label: "Lacrimal gland",
      group: "Nerve and eyelid",
      tone: "chart-4", shade: 0.16,
      description:
        "Makes the watery part of tears, which keep the front of the eye moist and clean.",
    },
    {
      id: "upper-tarsal-plate",
      label: "Upper tarsal plate",
      group: "Nerve and eyelid",
      tone: "chart-1", shade: 0.19,
      description:
        "A firm plate of dense connective tissue that stiffens and shapes the upper eyelid.",
    },
    {
      id: "lower-tarsal-plate",
      label: "Lower tarsal plate",
      group: "Nerve and eyelid",
      tone: "chart-1", shade: 0.16,
      description:
        "A firm plate of dense connective tissue that supports the lower eyelid.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science (DBCLS), CC BY-SA 2.1 Japan",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/eye-3d/blob/99f74f1c096ae2813dd18e1ecb2c9cbbd701c530/public/models/LICENSE.txt",
  },
}

export type EyeProps = Omit<OrganViewerProps, "model">

export function Eye(props: EyeProps) {
  return <OrganViewer model={eyeModel} {...props} />
}
