import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Built in this repository by scripts/models/build.ts from BodyParts3D 4.3.
// The GLB is served from organui.com; see attribution.source.
const framed = [
  "pituitary-gland",
  "hypothalamus",
  "tuber-cinereum",
  "mammillary-bodies",
  "optic-chiasm",
  "right-optic-nerve",
  "left-optic-nerve",
  "right-optic-tract",
  "left-optic-tract",
  "right-cavernous-sinus",
]

export const pituitaryModel: OrganModel = {
  name: "Pituitary gland",
  src: "https://organui.com/models/pituitary.glb",
  bytes: 1002364,
  defaultView: "Left lateral",
  views: [
    {
      name: "Left lateral",
      direction: [1, 0, 0],
      structureIds: framed,
    },
    {
      name: "Anterior",
      direction: [0, 0, 1],
      structureIds: framed,
    },
    {
      name: "Inferior",
      direction: [0, -1, 0],
      structureIds: framed,
    },
  ],
  hiddenIds: ["sphenoid-bone"],
  structures: [
    {
      id: "pituitary-gland",
      label: "Pituitary gland",
      group: "Pituitary gland",
      tone: "chart-1", shade: 0.11,
      description:
        "A pea-sized gland hanging from the base of the brain on a thin stalk. Its front lobe makes hormones that run the thyroid, adrenals, growth and fertility; its back lobe releases hormones made in the hypothalamus.",
    },
    {
      id: "hypothalamus",
      label: "Hypothalamus",
      group: "Hypothalamus",
      tone: "chart-2", shade: 0.11,
      description:
        "The floor and lower walls of the third ventricle. It senses the body's state and controls the pituitary through nerve fibres and a private blood supply.",
    },
    {
      id: "tuber-cinereum",
      label: "Tuber cinereum",
      group: "Hypothalamus",
      tone: "chart-2", shade: 0.05,
      description:
        "The grey bulge of the hypothalamus between the optic chiasm and the mammillary bodies. The pituitary stalk leaves from its centre.",
    },
    {
      id: "mammillary-bodies",
      label: "Mammillary bodies",
      group: "Hypothalamus",
      tone: "chart-2", shade: 0.01,
      description:
        "A pair of round bumps behind the tuber cinereum. They relay memory signals from the hippocampus toward the thalamus.",
    },
    {
      id: "supraoptic-nuclei",
      label: "Supraoptic nuclei",
      group: "Hypothalamus",
      tone: "chart-2", shade: 0.1,
      description:
        "Cell clusters just above the optic tracts that make antidiuretic hormone. Their fibres run down the stalk to the back lobe, which releases it.",
    },
    {
      id: "paraventricular-nuclei",
      label: "Paraventricular nuclei",
      group: "Hypothalamus",
      tone: "chart-2", shade: 0.05,
      description:
        "Cell clusters in the wall of the third ventricle that make oxytocin and signal the pituitary to drive the stress response.",
    },
    {
      id: "optic-chiasm",
      label: "Optic chiasm",
      group: "Visual pathway",
      tone: "chart-2", shade: 0.16,
      description:
        "Where the optic nerves meet and half their fibres cross, just in front of and above the pituitary stalk. A growing pituitary tumour presses on it first, narrowing side vision.",
    },
    {
      id: "right-optic-nerve",
      label: "Right optic nerve",
      group: "Visual pathway",
      tone: "chart-2", shade: 0.11,
      description:
        "Carries signals from the right eye back through the optic canal to the chiasm.",
    },
    {
      id: "left-optic-nerve",
      label: "Left optic nerve",
      group: "Visual pathway",
      tone: "chart-2", shade: 0.08,
      description:
        "Carries signals from the left eye back through the optic canal to the chiasm.",
    },
    {
      id: "right-optic-tract",
      label: "Right optic tract",
      group: "Visual pathway",
      tone: "chart-2", shade: 0.07,
      description:
        "Continues from the chiasm around the midbrain toward the thalamus, carrying the left half of what both eyes see.",
    },
    {
      id: "left-optic-tract",
      label: "Left optic tract",
      group: "Visual pathway",
      tone: "chart-2", shade: 0.04,
      description:
        "Continues from the chiasm around the midbrain, carrying the right half of what both eyes see.",
    },
    {
      id: "hypophyseal-portal-veins",
      label: "Hypophyseal portal veins",
      group: "Blood supply",
      tone: "chart-4", shade: 0.08,
      description:
        "Small veins that carry releasing hormones from the hypothalamus down the stalk straight to the front lobe, before they reach the rest of the body.",
    },
    {
      id: "right-superior-hypophyseal-artery",
      label: "Right superior hypophyseal artery",
      group: "Blood supply",
      tone: "chart-1", shade: 0.06,
      description:
        "A branch of the internal carotid artery that feeds the stalk and the start of the portal system. The model includes the right one only.",
    },
    {
      id: "right-inferior-hypophyseal-artery",
      label: "Right inferior hypophyseal artery",
      group: "Blood supply",
      tone: "chart-1", shade: 0.01,
      description:
        "A branch of the internal carotid artery in the cavernous sinus that mainly feeds the back lobe. The model includes the right one only.",
    },
    {
      id: "right-internal-carotid-artery",
      label: "Right internal carotid artery",
      group: "Blood supply",
      tone: "chart-1", shade: -0.03,
      description:
        "The main artery to the front of the brain. It climbs through the skull base and curves through the cavernous sinus beside the gland.",
    },
    {
      id: "right-cavernous-sinus",
      label: "Right cavernous sinus",
      group: "Venous sinuses",
      tone: "chart-4", shade: 0.05,
      description:
        "A venous space on the side of the sella turcica that drains the gland. The internal carotid artery and the nerves to the eye muscles pass through it.",
    },
    {
      id: "anterior-intercavernous-sinus",
      label: "Anterior intercavernous sinus",
      group: "Venous sinuses",
      tone: "chart-4", shade: 0.1,
      description:
        "Links the two cavernous sinuses across the front of the gland.",
    },
    {
      id: "posterior-intercavernous-sinus",
      label: "Posterior intercavernous sinus",
      group: "Venous sinuses",
      tone: "chart-4", shade: 0.01,
      description: "Links the two cavernous sinuses behind the gland.",
    },
    {
      id: "sphenoid-bone",
      label: "Sphenoid bone",
      group: "Skull base",
      tone: "chart-2", shade: 0.24,
      description:
        "The bone across the middle of the skull base. The pituitary sits in the sella turcica, a saddle-shaped hollow on its upper surface, which is why surgeons often reach it through the nose and sphenoid sinus.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/organui/blob/master/apps/web/public/models/pituitary.ATTRIBUTION.md",
  },
}

export type PituitaryProps = Omit<OrganViewerProps, "model">

export function Pituitary(props: PituitaryProps) {
  return <OrganViewer model={pituitaryModel} {...props} />
}
