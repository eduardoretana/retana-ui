import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/nose-3d at e8acaad. The GLB stays in that
// repository under its own licence; see attribution.source.
export const noseModel: OrganModel = {
  name: "Nose",
  src: "https://cdn.jsdelivr.net/gh/organui/nose-3d@e8acaadd578c9e3b9f7c5cbc6b4e6d8d05dc25f0/public/models/nose.glb",
  bytes: 3795692,
  defaultView: "Oblique",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Oblique",
      direction: [0.85, 0.2, 1],
    },
    {
      name: "Lateral",
      direction: [1, 0, 0],
    },
  ],
  structures: [
    {
      id: "nasal-bones",
      label: "Nasal bones",
      group: "External nose",
      color: "#f0d29c",
      description:
        "Two small bones that meet in the midline and form the bony bridge of the nose.",
    },
    {
      id: "lateral-cartilages",
      label: "Lateral nasal cartilages",
      group: "External nose",
      color: "#a9c7d4",
      description:
        "Triangular plates of cartilage below the nasal bones that shape the middle of the nose. They are wings of the septal cartilage.",
    },
    {
      id: "alar-cartilages",
      label: "Major alar cartilages",
      group: "External nose",
      color: "#8fb3c7",
      description:
        "Curved cartilages that form the tip of the nose and hold the nostrils open.",
    },
    {
      id: "septal-cartilage",
      label: "Septal cartilage",
      group: "Nasal septum",
      color: "#7fa6bd",
      description:
        "The front of the wall between the two nasal passages. It joins the nasal bones above and the vomer and ethmoid behind.",
    },
    {
      id: "vomer",
      label: "Vomer",
      group: "Nasal septum",
      color: "#cdb48d",
      description:
        "A flat bone that forms the lower back part of the septum, reaching back to the openings into the throat.",
    },
    {
      id: "nasal-cavity",
      label: "Nasal cavity lining",
      group: "Nasal cavity",
      color: "#d98a8a",
      description:
        "The mucous membrane that lines both nasal passages. It warms, moistens and filters the air, and its outline shows the extent of the nasal passages.",
    },
    {
      id: "inferior-conchae",
      label: "Inferior nasal conchae",
      group: "Nasal cavity",
      color: "#c99b7a",
      description:
        "Scroll-shaped bones on the side walls of the nasal cavity. With their lining they slow the air so it can be warmed and moistened.",
    },
    {
      id: "palatine-bones",
      label: "Palatine bones",
      group: "Nasal cavity",
      color: "#bfa98a",
      description:
        "L-shaped bones at the back of the nasal cavity. They form the back of the hard palate, which is the floor of the nose.",
    },
    {
      id: "lacrimal-bones",
      label: "Lacrimal bones",
      group: "Nasal cavity",
      color: "#d8bf99",
      description:
        "Small, thin bones in the inner wall of each orbit. The tear duct runs past them into the nose.",
    },
    {
      id: "olfactory-nerves",
      label: "Olfactory nerves",
      group: "Nasal cavity",
      color: "#e3c25a",
      description:
        "Carry smell from the roof of the nasal cavity, through the ethmoid bone, to the olfactory bulbs and tracts under the brain.",
    },
    {
      id: "frontal-sinuses",
      label: "Frontal sinuses",
      group: "Paranasal sinuses",
      color: "#5fb3c9",
      description:
        "Air spaces in the forehead, above the root of the nose, split by a septum. They drain down into the nose under the middle concha.",
    },
    {
      id: "anterior-ethmoid-cells",
      label: "Anterior ethmoid cells",
      group: "Paranasal sinuses",
      color: "#6cc0d0",
      description:
        "The front group of small air cells between the nose and the orbits. They drain under the middle concha.",
    },
    {
      id: "middle-ethmoid-cells",
      label: "Middle ethmoid cells",
      group: "Paranasal sinuses",
      color: "#4fa3b8",
      description:
        "The middle group of ethmoid air cells. They open onto the side wall of the nose under the middle concha.",
    },
    {
      id: "posterior-ethmoid-cells",
      label: "Posterior ethmoid cells",
      group: "Paranasal sinuses",
      color: "#3d8ea5",
      description:
        "The back group of ethmoid air cells, next to the sphenoid sinus. They drain under the superior concha.",
    },
    {
      id: "maxillary-sinuses",
      label: "Maxillary sinuses",
      group: "Paranasal sinuses",
      color: "#72c0cf",
      description:
        "The largest sinuses, in the cheekbones beside the nose and under the eyes. Their opening is high on the inner wall, under the middle concha.",
    },
    {
      id: "sphenoid-sinus",
      label: "Sphenoid sinus",
      group: "Paranasal sinuses",
      color: "#2f7f99",
      description:
        "Air spaces deep in the skull behind the nose, just under the pituitary gland, divided by a septum.",
    },
    {
      id: "frontal-bone",
      label: "Frontal bone",
      group: "Sinus bones",
      color: "#ece4d2",
      description:
        "The bone of the forehead and the roofs of the orbits. It holds the frontal sinuses.",
    },
    {
      id: "ethmoid",
      label: "Ethmoid bone",
      group: "Sinus bones",
      color: "#d9bd8c",
      description:
        "A light bone between the orbits. It forms the roof and upper side walls of the nasal cavity, the middle and superior conchae, the back of the septum, and holds the ethmoid cells.",
    },
    {
      id: "maxillae",
      label: "Maxillae",
      group: "Sinus bones",
      color: "#e6d3b0",
      description:
        "The upper jaw bones. They form the cheeks, the side walls and most of the floor of the nasal cavity, and hold the maxillary sinuses.",
    },
    {
      id: "sphenoid-bone",
      label: "Sphenoid bone",
      group: "Sinus bones",
      color: "#c8b089",
      description:
        "A bone at the centre of the skull base, behind the nasal cavity. Its body holds the sphenoid sinus.",
    },
    {
      id: "pituitary",
      label: "Pituitary gland",
      group: "Neighbours",
      color: "#b27fb0",
      description:
        "A hormone gland that sits in a hollow on top of the sphenoid bone, directly above the sphenoid sinus.",
    },
    {
      id: "nasopharynx",
      label: "Nasopharynx",
      group: "Neighbours",
      color: "#d7a0a0",
      description:
        "The top of the throat, behind the nasal cavity. Air passes into it through the two openings at the back of the nose.",
    },
  ],
  attribution: {
    credit:
      "Z-Anatomy (CC BY-SA 4.0), based in part on BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 Japan). Adapted by OrganUI.",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source:
      "https://github.com/organui/nose-3d/blob/e8acaadd578c9e3b9f7c5cbc6b4e6d8d05dc25f0/public/models/ATTRIBUTION.md",
  },
}

export type NoseProps = Omit<OrganViewerProps, "model">

export function Nose(props: NoseProps) {
  return <OrganViewer model={noseModel} {...props} />
}
