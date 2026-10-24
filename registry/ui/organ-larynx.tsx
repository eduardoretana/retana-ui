import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/larynx-3d at aa18162. The GLB stays in that
// repository under its own licence; see attribution.source.
export const larynxModel: OrganModel = {
  name: "Larynx",
  src: "https://cdn.jsdelivr.net/gh/organui/larynx-3d@aa18162e23a7617b1db91e5b929f05940fede2b2/public/models/larynx.glb",
  bytes: 5257920,
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
    {
      name: "Superior",
      direction: [0, 1, 0.35],
    },
  ],
  structures: [
    {
      id: "hyoid-bone",
      label: "Hyoid bone",
      group: "Cartilages and bone",
      color: "#e6d8b8",
      description:
        "A U-shaped bone above the larynx that touches no other bone. The larynx hangs from it by the thyrohyoid membrane.",
    },
    {
      id: "thyroid-cartilage",
      label: "Thyroid cartilage",
      group: "Cartilages and bone",
      color: "#9fb9c4",
      description:
        "The largest cartilage of the larynx. Its two plates meet at the front to form the laryngeal prominence, the Adam’s apple, and shield the vocal folds.",
    },
    {
      id: "cricoid-cartilage",
      label: "Cricoid cartilage",
      group: "Cartilages and bone",
      color: "#88a8b8",
      description:
        "The only complete ring of cartilage in the airway, narrow at the front and tall at the back. It sits below the thyroid cartilage and on top of the trachea.",
    },
    {
      id: "epiglottis",
      label: "Epiglottis",
      group: "Cartilages and bone",
      color: "#b7c99e",
      description:
        "A leaf-shaped flap of elastic cartilage behind the tongue. It tips back over the entrance of the larynx when you swallow.",
    },
    {
      id: "arytenoid-cartilages",
      label: "Arytenoid cartilages",
      group: "Cartilages and bone",
      color: "#7e9cc2",
      description:
        "Two small pyramids on the back of the cricoid. The vocal ligaments attach to them, so their rocking and sliding opens and closes the vocal folds.",
    },
    {
      id: "corniculate-cuneiform-cartilages",
      label: "Corniculate and cuneiform cartilages",
      group: "Cartilages and bone",
      color: "#a99cc7",
      description:
        "Tiny nodules of cartilage. The corniculates cap the arytenoids and the cuneiforms stiffen the aryepiglottic folds at the entrance of the larynx.",
    },
    {
      id: "thyrohyoid-membrane",
      label: "Thyrohyoid membrane",
      group: "Ligaments and membranes",
      color: "#d9c48f",
      description:
        "A sheet that hangs the thyroid cartilage from the hyoid bone. It is thickened in the midline and at its back edges into the thyrohyoid ligaments.",
    },
    {
      id: "cricothyroid-ligament",
      label: "Median cricothyroid ligament",
      group: "Ligaments and membranes",
      color: "#e0b56e",
      description:
        "Bridges the gap at the front between the thyroid and cricoid cartilages. It can be felt just below the Adam’s apple.",
    },
    {
      id: "conus-elasticus",
      label: "Conus elasticus",
      group: "Ligaments and membranes",
      color: "#c7b07a",
      description:
        "An elastic membrane rising from the cricoid toward the vocal folds. Its free upper edge thickens into the vocal ligaments.",
    },
    {
      id: "vocal-ligaments",
      label: "Vocal ligaments",
      group: "Ligaments and membranes",
      color: "#f0d27a",
      description:
        "Two bands running from the back of the thyroid cartilage to the arytenoids. With the vocalis muscles they form the vocal folds, which vibrate to make sound.",
    },
    {
      id: "epiglottic-ligaments",
      label: "Epiglottic ligaments",
      group: "Ligaments and membranes",
      color: "#cdb98c",
      description:
        "Tie the epiglottis forward to the hyoid bone and its stalk down to the inside of the thyroid cartilage.",
    },
    {
      id: "cricothyroid-muscle",
      label: "Cricothyroid",
      group: "Muscles",
      color: "#c56b5c",
      description:
        "The only intrinsic muscle on the outside of the larynx. It tilts the thyroid cartilage forward, stretching the vocal folds and raising the pitch of the voice.",
    },
    {
      id: "posterior-crico-arytenoid",
      label: "Posterior crico-arytenoid",
      group: "Muscles",
      color: "#b45a52",
      description:
        "On the back of the cricoid. It is the only muscle that opens the vocal folds, which keeps the airway open for breathing.",
    },
    {
      id: "lateral-crico-arytenoid",
      label: "Lateral crico-arytenoid",
      group: "Muscles",
      color: "#d07f6b",
      description:
        "Rotates the arytenoids inward to bring the vocal folds together.",
    },
    {
      id: "arytenoid-muscles",
      label: "Arytenoid muscles",
      group: "Muscles",
      color: "#a8524f",
      description:
        "Span the backs of the two arytenoids. They pull the cartilages together to close the back of the glottis.",
    },
    {
      id: "thyro-arytenoid",
      label: "Thyro-arytenoid",
      group: "Muscles",
      color: "#d99282",
      description:
        "Runs beside the vocal folds from the thyroid cartilage to the arytenoids. It shortens and relaxes the folds, lowering the pitch.",
    },
    {
      id: "vocalis",
      label: "Vocalis",
      group: "Muscles",
      color: "#e3a08c",
      description:
        "The innermost fibres of the thyro-arytenoid, lying along each vocal ligament. They fine-tune the tension of the vocal folds.",
    },
    {
      id: "aryepiglottic-muscle",
      label: "Aryepiglottic",
      group: "Muscles",
      color: "#bd7468",
      description:
        "Thin fibres running from the arytenoids up to the sides of the epiglottis. They help narrow the entrance of the larynx when you swallow.",
    },
    {
      id: "trachea",
      label: "Trachea",
      group: "Airway",
      color: "#d7a1a4",
      description:
        "The windpipe. It continues from the cricoid cartilage down into the chest, held open by C-shaped rings of cartilage, and divides into the two main bronchi.",
    },
    {
      id: "thyroid-gland",
      label: "Thyroid gland",
      group: "Neighbouring organs",
      color: "#a5675f",
      description:
        "A hormone gland wrapped around the front of the upper trachea. Its isthmus crosses the trachea just below the cricoid cartilage.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/larynx-3d/blob/aa18162e23a7617b1db91e5b929f05940fede2b2/public/models/ATTRIBUTION.md",
  },
}

export type LarynxProps = Omit<OrganViewerProps, "model">

export function Larynx(props: LarynxProps) {
  return <OrganViewer model={larynxModel} {...props} />
}
