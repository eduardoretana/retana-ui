import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/pharynx-3d at c375909. The GLB stays in that
// repository under its own licence; see attribution.source.
export const pharynxModel: OrganModel = {
  name: "Pharynx",
  src: "https://cdn.jsdelivr.net/gh/organui/pharynx-3d@c3759092b524ab4637d691168bdc08bbee1fcfbb/public/models/pharynx.glb",
  bytes: 7148788,
  defaultView: "Posterior",
  views: [
    {
      name: "Posterior",
      direction: [0, 0, -1],
    },
    {
      name: "Left lateral",
      direction: [1, 0, 0],
    },
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
  ],
  structures: [
    {
      id: "superior-constrictor",
      label: "Superior pharyngeal constrictor",
      group: "Constrictors",
      color: "#c8705f",
      description:
        "The top of the three curved muscles that form the back and side walls of the pharynx. It wraps the nasal and oral parts of the throat and squeezes food downward when you swallow.",
    },
    {
      id: "middle-constrictor",
      label: "Middle pharyngeal constrictor",
      group: "Constrictors",
      color: "#d98a6c",
      description:
        "A fan-shaped muscle that starts on the hyoid bone and spreads backward to the midline seam. Its upper fibres overlap the superior constrictor from behind.",
    },
    {
      id: "inferior-constrictor",
      label: "Inferior pharyngeal constrictor",
      group: "Constrictors",
      color: "#b85f55",
      description:
        "The thickest constrictor. It starts on the thyroid and cricoid cartilages, overlaps the middle constrictor and continues into the esophagus. Its lowest fibres act as the upper esophageal sphincter.",
    },
    {
      id: "pharyngeal-raphe",
      label: "Pharyngeal raphe",
      group: "Constrictors",
      color: "#e6d3b8",
      description:
        "A fibrous seam down the back of the pharynx where the left and right constrictors meet. It hangs from the base of the skull.",
    },
    {
      id: "stylopharyngeus",
      label: "Stylopharyngeus",
      group: "Longitudinal muscles",
      color: "#c99a6b",
      description:
        "A slender muscle from the styloid process of the skull. It slips between the superior and middle constrictors and lifts and widens the pharynx during swallowing.",
    },
    {
      id: "palatopharyngeus",
      label: "Palatopharyngeus",
      group: "Longitudinal muscles",
      color: "#d6a07f",
      description:
        "Runs from the soft palate down the inside of the pharyngeal wall to the thyroid cartilage. It raises the pharynx and larynx and forms the back arch of the tonsil bed.",
    },
    {
      id: "salpingopharyngeus",
      label: "Salpingopharyngeus",
      group: "Longitudinal muscles",
      color: "#e3b48f",
      description:
        "A small muscle from the cartilage of the auditory tube that blends into palatopharyngeus. It helps raise the pharynx when you swallow.",
    },
    {
      id: "levator-veli-palatini",
      label: "Levator veli palatini",
      group: "Soft palate",
      color: "#a87fa8",
      description:
        "Lifts the soft palate up and back against the back wall of the pharynx, sealing the nose off from the mouth when you swallow or speak.",
    },
    {
      id: "tensor-veli-palatini",
      label: "Tensor veli palatini",
      group: "Soft palate",
      color: "#8f8fbf",
      description:
        "Hooks around a small bony pulley and tightens the soft palate. It also opens the auditory tube, which is why swallowing can make your ears pop.",
    },
    {
      id: "musculus-uvulae",
      label: "Musculus uvulae",
      group: "Soft palate",
      color: "#c290b8",
      description:
        "A small paired muscle inside the uvula. It shortens and thickens the uvula, helping the soft palate seal against the back of the pharynx.",
    },
    {
      id: "tongue",
      label: "Tongue",
      group: "Larynx and tongue",
      color: "#d99a9a",
      description:
        "The back of the tongue forms the front wall of the oral part of the pharynx. When you swallow it pushes food back into the pharynx.",
    },
    {
      id: "epiglottis",
      label: "Epiglottis",
      group: "Larynx and tongue",
      color: "#cfd6a0",
      description:
        "A leaf of cartilage behind the tongue. It tips back over the entrance to the larynx during swallowing, steering food around it into the lower pharynx.",
    },
    {
      id: "hyoid-bone",
      label: "Hyoid bone",
      group: "Larynx and tongue",
      color: "#e8e1cf",
      description:
        "A U-shaped bone at the root of the tongue. The middle constrictor attaches to its horns, and it rises with the larynx when you swallow.",
    },
    {
      id: "thyroid-cartilage",
      label: "Thyroid cartilage",
      group: "Larynx and tongue",
      color: "#b9c7cf",
      description:
        "The largest cartilage of the larynx, forming the Adam’s apple. The inferior constrictor attaches to its side.",
    },
    {
      id: "cricoid-cartilage",
      label: "Cricoid cartilage",
      group: "Larynx and tongue",
      color: "#a7b6c0",
      description:
        "A ring of cartilage below the thyroid cartilage. The pharynx becomes the esophagus at its lower border, about level with the sixth cervical vertebra.",
    },
    {
      id: "arytenoid-cartilages",
      label: "Arytenoid cartilages",
      group: "Larynx and tongue",
      color: "#95a7b4",
      description:
        "Two small cartilages on the back of the cricoid. They face into the lower pharynx, where food passes on either side of the larynx.",
    },
    {
      id: "ascending-pharyngeal-artery",
      label: "Ascending pharyngeal artery",
      group: "Vessels and nerves",
      color: "#b8564c",
      description:
        "A long thin branch of the external carotid artery that climbs beside the pharynx and supplies its wall, the soft palate and the tonsil.",
    },
    {
      id: "pharyngeal-venous-plexus",
      label: "Pharyngeal venous plexus",
      group: "Vessels and nerves",
      color: "#5f7fa6",
      description:
        "A network of veins on the outer surface of the constrictors. It drains into the internal jugular vein.",
    },
    {
      id: "glossopharyngeal-nerves",
      label: "Glossopharyngeal nerves",
      group: "Vessels and nerves",
      color: "#e0c25a",
      description:
        "The ninth cranial nerve. It carries sensation from the pharynx and back of the tongue, triggers the gag reflex and supplies stylopharyngeus.",
    },
    {
      id: "pharyngeal-nerves",
      label: "Pharyngeal nerves",
      group: "Vessels and nerves",
      color: "#ead27a",
      description:
        "Small branches from the pterygopalatine ganglion that carry sensation from the lining of the upper, nasal part of the pharynx.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/pharynx-3d/blob/c3759092b524ab4637d691168bdc08bbee1fcfbb/public/models/ATTRIBUTION.md",
  },
}

export type PharynxProps = Omit<OrganViewerProps, "model">

export function Pharynx(props: PharynxProps) {
  return <OrganViewer model={pharynxModel} {...props} />
}
