import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/tongue-3d at 38841f8. The GLB stays in that
// repository under its own licence; see attribution.source.
export const tongueModel: OrganModel = {
  name: "Tongue",
  src: "https://cdn.jsdelivr.net/gh/organui/tongue-3d@38841f8ebc82849f56e891b79b2daca9591e0806/public/models/tongue.glb",
  bytes: 1295752,
  defaultView: "Left lateral",
  views: [
    {
      name: "Left lateral",
      direction: [1, 0, 0],
    },
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Superior",
      direction: [0, 1, 0.35],
    },
  ],
  structures: [
    {
      id: "tongue",
      label: "Tongue",
      group: "Tongue",
      color: "#d98a8a",
      description:
        "A muscular organ on the floor of the mouth. It shapes food for swallowing, carries the taste buds and forms the sounds of speech.",
    },
    {
      id: "genioglossus",
      label: "Genioglossus",
      group: "Extrinsic muscles",
      color: "#b8564c",
      description:
        "A fan-shaped muscle from the inside of the chin into the body of the tongue. It pushes the tongue forward and out.",
    },
    {
      id: "hyoglossus",
      label: "Hyoglossus",
      group: "Extrinsic muscles",
      color: "#c9725f",
      description:
        "A thin, flat muscle rising from the hyoid bone into the side of the tongue. It pulls the tongue down and back.",
    },
    {
      id: "geniohyoid",
      label: "Geniohyoid",
      group: "Floor of mouth",
      color: "#a8645a",
      description:
        "A narrow muscle running from the chin to the hyoid bone just below the genioglossus. It pulls the hyoid forward.",
    },
    {
      id: "mylohyoid",
      label: "Mylohyoid",
      group: "Floor of mouth",
      color: "#c2867a",
      description:
        "A sheet of muscle that forms the floor of the mouth beneath the tongue. It raises the floor of the mouth when swallowing.",
    },
    {
      id: "hyoid-bone",
      label: "Hyoid bone",
      group: "Nearby structures",
      color: "#e8dcc2",
      description:
        "A U-shaped bone in the upper neck that anchors the tongue and the floor of the mouth. It does not touch any other bone.",
    },
    {
      id: "epiglottis",
      label: "Epiglottis",
      group: "Nearby structures",
      color: "#b9c4a0",
      description:
        "A leaf-shaped flap of cartilage behind the root of the tongue. It tips back over the larynx when you swallow.",
    },
    {
      id: "submandibular-glands",
      label: "Submandibular glands",
      group: "Nearby structures",
      color: "#dcb67e",
      description:
        "Salivary glands beneath the jaw on each side. Their ducts open under the tongue, beside its frenulum.",
    },
    {
      id: "sublingual-glands",
      label: "Sublingual glands",
      group: "Nearby structures",
      color: "#e3c79a",
      description:
        "The smallest of the main salivary glands. They lie in the floor of the mouth, under the front of the tongue.",
    },
    {
      id: "hypoglossal-nerves",
      label: "Hypoglossal nerves",
      group: "Nerves",
      color: "#e6c84f",
      description:
        "The twelfth cranial nerves. They run down from the skull and forward into the tongue, and move almost all of its muscles.",
    },
    {
      id: "lingual-nerves",
      label: "Lingual nerves",
      group: "Nerves",
      color: "#c9a93a",
      description:
        "Branches of the mandibular nerve that carry touch, temperature and, through the chorda tympani, taste from the front two thirds of the tongue.",
    },
    {
      id: "lingual-artery",
      label: "Lingual artery",
      group: "Vessels",
      color: "#a94a46",
      description:
        "A branch of the external carotid artery and the main blood supply of the tongue. It runs forward above the hyoid bone and gives off the sublingual artery.",
    },
    {
      id: "lingual-veins",
      label: "Lingual veins",
      group: "Vessels",
      color: "#6d8db0",
      description:
        "Drain the tongue toward the internal jugular vein. The deep lingual vein can be seen through the thin skin under the tongue.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/tongue-3d/blob/38841f8ebc82849f56e891b79b2daca9591e0806/public/models/ATTRIBUTION.md",
  },
}

export type TongueProps = Omit<OrganViewerProps, "model">

export function Tongue(props: TongueProps) {
  return <OrganViewer model={tongueModel} {...props} />
}
