import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

const labyrinth = [
  "vestibule",
  "anterior-canal",
  "posterior-canal",
  "lateral-canal",
  "cochlea",
]

// Built from the right inner ear of Z-Anatomy, the source organui/ear-3d
// uses, with the vestibule mesh split into its canals. The GLB is hosted by
// OrganUI; see attribution.source.
export const vestibularModel: OrganModel = {
  name: "Vestibular system",
  src: "https://organui.com/models/vestibular.glb",
  bytes: 503164,
  defaultView: "Lateral",
  views: [
    {
      name: "Lateral",
      direction: [-1, 0.15, 0.2],
      structureIds: labyrinth,
    },
    {
      name: "Superior",
      direction: [0, 1, 0.2],
      structureIds: labyrinth,
    },
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Medial",
      direction: [1, 0.1, 0],
    },
  ],
  structures: [
    {
      id: "anterior-canal",
      label: "Anterior semicircular canal",
      group: "Semicircular canals",
      color: "#d98c6a",
      description:
        "The highest canal, also called the superior canal, standing upright. It senses head rotation in its own plane, working as a pair with the posterior canal of the other ear. Its swollen end, the ampulla, holds the sensor.",
    },
    {
      id: "posterior-canal",
      label: "Posterior semicircular canal",
      group: "Semicircular canals",
      color: "#7fb07a",
      description:
        "Upright and at right angles to the anterior canal, reaching back and down. The two share their non-ampullary limbs as the common crus. Loose crystals most often drift into this canal in benign paroxysmal positional vertigo.",
    },
    {
      id: "lateral-canal",
      label: "Lateral semicircular canal",
      group: "Semicircular canals",
      color: "#c9a64f",
      description:
        "The horizontal canal, tilted about 30 degrees up at the front when the head is upright. It senses turning the head from side to side, as in shaking it no.",
    },
    {
      id: "vestibule",
      label: "Vestibule",
      group: "Vestibule",
      color: "#93b4cf",
      description:
        "The central chamber of the bony labyrinth, where all three canals open. It holds the utricle and saccule, whose sensors register gravity and straight-line acceleration. Those membranous sacs are not modelled; this is the bony wall around them.",
    },
    {
      id: "cochlea",
      label: "Cochlea",
      group: "Nearby structures",
      color: "#a99cc9",
      description:
        "The hearing part of the inner ear, opening from the front of the vestibule. It shares the same fluid spaces, which is why some inner ear disorders affect hearing and balance together.",
    },
    {
      id: "vestibular-nerve",
      label: "Vestibular nerve",
      group: "Nearby structures",
      color: "#e9d36f",
      description:
        "Carries balance signals from the canals, utricle and saccule to the vestibular nuclei in the brainstem. It runs with the cochlear nerve through the internal acoustic meatus as part of cranial nerve VIII.",
    },
  ],
  attribution: {
    credit:
      "Z-Anatomy (CC BY-SA 4.0), based in part on BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 Japan). Adapted by OrganUI.",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source:
      "https://github.com/organui/organui/blob/master/apps/web/public/models/vestibular.ATTRIBUTION.md",
  },
}

export type VestibularProps = Omit<OrganViewerProps, "model">

export function Vestibular(props: VestibularProps) {
  return <OrganViewer model={vestibularModel} {...props} />
}
