import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/ear-3d at 40ace7e. The GLB stays in that
// repository under its own licence; see attribution.source.
export const earModel: OrganModel = {
  name: "Ear",
  src: "https://cdn.jsdelivr.net/gh/organui/ear-3d@40ace7ed45cdbf604adda889e5db720ee6b1ce98/public/models/ear.glb",
  bytes: 1010340,
  defaultView: "Anterior",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Lateral",
      direction: [-1, 0.1, 0.25],
    },
    {
      name: "Superior",
      direction: [0, 1, 0.3],
    },
  ],
  structures: [
    {
      id: "helix",
      label: "Helix",
      group: "Outer ear",
      color: "#e0a48f",
      description:
        "The curled outer rim of the auricle. It runs from above the ear canal up and around the top and back of the ear.",
    },
    {
      id: "antihelix",
      label: "Antihelix",
      group: "Outer ear",
      color: "#d18f7c",
      description:
        "A curved ridge inside the helix. At the top it splits into two crura that frame the triangular fossa.",
    },
    {
      id: "scapha-and-fossa",
      label: "Scapha and triangular fossa",
      group: "Outer ear",
      color: "#ebbba7",
      description:
        "Shallow hollows of the auricle: the scapha is the groove between helix and antihelix, the triangular fossa sits between the crura.",
    },
    {
      id: "concha",
      label: "Concha",
      group: "Outer ear",
      color: "#bf7d6e",
      description:
        "The deep bowl at the centre of the auricle. It funnels sound into the ear canal, which opens from its lower part.",
    },
    {
      id: "tragus",
      label: "Tragus and antitragus",
      group: "Outer ear",
      color: "#c98f84",
      description:
        "Two small flaps either side of the opening of the ear canal. The tragus is in front, the antitragus below and behind it.",
    },
    {
      id: "lobule",
      label: "Lobule",
      group: "Outer ear",
      color: "#efc2b2",
      description:
        "The soft earlobe at the bottom of the auricle. It contains fat and no cartilage.",
    },
    {
      id: "back-of-auricle",
      label: "Back of the auricle",
      group: "Outer ear",
      color: "#d7a596",
      description:
        "The surface facing the head. Its bulges mirror the hollows on the front, and a groove joins it to the scalp.",
    },
    {
      id: "tympanic-membrane",
      label: "Eardrum",
      group: "Outer ear",
      color: "#c8b6d8",
      description:
        "A thin membrane at the end of the ear canal. Sound makes it vibrate, and the malleus attached to it passes the vibration on.",
    },
    {
      id: "malleus",
      label: "Malleus",
      group: "Middle ear",
      color: "#efe2c4",
      description:
        "The first and largest ossicle, about 8 mm long. Its handle is attached to the eardrum and its head joins the incus.",
    },
    {
      id: "incus",
      label: "Incus",
      group: "Middle ear",
      color: "#e3cf9f",
      description:
        "The middle ossicle. Its body joins the malleus and its long limb reaches down to the stapes.",
    },
    {
      id: "stapes",
      label: "Stapes",
      group: "Middle ear",
      color: "#d5bb7e",
      description:
        "The smallest bone in the body. Its footplate sits in the oval window and pushes vibrations into the fluid of the inner ear.",
    },
    {
      id: "auditory-tube",
      label: "Auditory tube",
      group: "Middle ear",
      color: "#9fb8a0",
      description:
        "Connects the middle ear to the back of the nose. It opens when you swallow or yawn to balance pressure on both sides of the eardrum.",
    },
    {
      id: "chorda-tympani",
      label: "Chorda tympani",
      group: "Middle ear",
      color: "#e39a52",
      description:
        "A branch of the facial nerve that crosses the middle ear between the malleus and incus, carrying taste from the front of the tongue.",
    },
    {
      id: "cochlea",
      label: "Cochlea",
      group: "Inner ear",
      color: "#7f9fc4",
      description:
        "A fluid-filled spiral of about two and a half turns. Hair cells along it turn vibrations into nerve signals, high pitches at the base and low pitches at the apex.",
    },
    {
      id: "vestibule",
      label: "Vestibule and semicircular canals",
      group: "Inner ear",
      color: "#93b4cf",
      description:
        "The balance organ. The vestibule senses gravity and straight-line motion, and three canals at right angles to each other sense head rotation.",
    },
    {
      id: "vestibulocochlear-nerve",
      label: "Vestibulocochlear nerve",
      group: "Inner ear",
      color: "#e9d36f",
      description:
        "Cranial nerve VIII. Its cochlear part carries hearing and its vestibular part carries balance from the inner ear to the brainstem.",
    },
  ],
  attribution: {
    credit:
      "Z-Anatomy (CC BY-SA 4.0), based in part on BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 Japan). Adapted by OrganUI.",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source:
      "https://github.com/organui/ear-3d/blob/40ace7ed45cdbf604adda889e5db720ee6b1ce98/public/models/ATTRIBUTION.md",
  },
}

export type EarProps = Omit<OrganViewerProps, "model">

export function Ear(props: EarProps) {
  return <OrganViewer model={earModel} {...props} />
}
