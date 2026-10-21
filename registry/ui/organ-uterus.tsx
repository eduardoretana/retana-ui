import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/uterus-3d at 404a603. The GLB stays in that
// repository under its own licence; see attribution.source.
export const uterusModel: OrganModel = {
  name: "Uterus",
  src: "https://cdn.jsdelivr.net/gh/organui/uterus-3d@404a6039b2d667e2b4e08ae71d4964cd9b963cf1/public/models/reproductive.glb",
  bytes: 4008116,
  defaultView: "Anterior",
  hiddenIds: ["broad-ligament", "bladder"],
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Superior",
      direction: [0, 1, 0.35],
    },
    {
      name: "Left lateral",
      direction: [1, 0, 0],
    },
  ],
  structures: [
    {
      id: "fundus",
      label: "Fundus",
      group: "Uterus and vagina",
      tone: "chart-1", shade: 0.08,
      description:
        "The rounded top of the uterus, above the points where the uterine tubes enter.",
    },
    {
      id: "body",
      label: "Body",
      group: "Uterus and vagina",
      tone: "chart-1", shade: 0.17,
      description:
        "The main, muscular part of the uterus. A pregnancy develops inside it.",
    },
    {
      id: "cornua",
      label: "Cornua",
      group: "Uterus and vagina",
      tone: "chart-1", shade: 0.19,
      description:
        "The upper corners of the uterus, where the uterine tubes join it.",
    },
    {
      id: "tubal-ostia",
      label: "Tubal openings",
      group: "Uterus and vagina",
      tone: "chart-1", shade: 0.01,
      description:
        "Where each uterine tube opens into the cavity of the uterus.",
    },
    {
      id: "lower-segment",
      label: "Lower uterine segment",
      group: "Uterus and vagina",
      tone: "chart-1", shade: 0.13,
      description:
        "The narrow part between the body and the cervix, also called the isthmus of the uterus.",
    },
    {
      id: "cervix",
      label: "Cervix",
      group: "Uterus and vagina",
      tone: "chart-1", shade: 0.09,
      description:
        "The lower, narrow end of the uterus. Its canal links the cavity of the uterus to the vagina.",
    },
    {
      id: "internal-os",
      label: "Internal os",
      group: "Uterus and vagina",
      tone: "chart-1", shade: -0.05,
      description:
        "The upper opening of the cervical canal, into the cavity of the uterus.",
    },
    {
      id: "external-os",
      label: "External os",
      group: "Uterus and vagina",
      tone: "chart-1", shade: -0.1,
      description: "The lower opening of the cervical canal, into the vagina.",
    },
    {
      id: "vagina",
      label: "Vagina",
      group: "Uterus and vagina",
      tone: "chart-1", shade: 0.19,
      description:
        "A muscular canal that runs from the cervix down to the outside of the body.",
    },
    {
      id: "cervicovaginal-junction",
      label: "Cervicovaginal junction",
      group: "Uterus and vagina",
      tone: "chart-1", shade: 0.05,
      description: "Where the cervix meets the upper end of the vagina.",
    },
    {
      id: "isthmus",
      label: "Isthmus",
      group: "Uterine tubes",
      tone: "chart-2", shade: 0.09,
      description:
        "The narrow inner third of each uterine tube, next to the uterus.",
    },
    {
      id: "ampulla",
      label: "Ampulla",
      group: "Uterine tubes",
      tone: "chart-2", shade: 0.13,
      description:
        "The wide, curving middle part of each tube and the usual place where fertilisation happens.",
    },
    {
      id: "infundibulum",
      label: "Infundibulum",
      group: "Uterine tubes",
      tone: "chart-2", shade: 0.05,
      description:
        "The funnel-shaped outer end of each tube, which opens beside the ovary.",
    },
    {
      id: "fimbriae",
      label: "Fimbriae",
      group: "Uterine tubes",
      tone: "chart-2", shade: -0.0,
      description:
        "Finger-like fringes around the open end of each tube that sweep a released egg inside.",
    },
    {
      id: "left-ovary",
      label: "Left ovary",
      group: "Ovaries",
      tone: "chart-5", shade: 0.09,
      description:
        "An almond-shaped gland that holds the egg follicles and makes oestrogen and progesterone.",
    },
    {
      id: "right-ovary",
      label: "Right ovary",
      group: "Ovaries",
      tone: "chart-5", shade: 0.04,
      description:
        "An almond-shaped gland that holds the egg follicles and makes oestrogen and progesterone.",
    },
    {
      id: "broad-ligament",
      label: "Broad ligament",
      group: "Ligaments",
      tone: "chart-1", shade: 0.2,
      description:
        "A wide fold of peritoneum that drapes over the uterus, tubes and ovaries and joins them to the side walls of the pelvis.",
    },
    {
      id: "mesosalpinx",
      label: "Mesosalpinx",
      group: "Ligaments",
      tone: "chart-2", shade: 0.23,
      description:
        "The upper part of the broad ligament that holds each uterine tube.",
    },
    {
      id: "mesovarium",
      label: "Mesovarium",
      group: "Ligaments",
      tone: "chart-5", shade: 0.22,
      description:
        "The short fold of the broad ligament that attaches each ovary.",
    },
    {
      id: "ovarian-ligaments",
      label: "Ovarian ligaments",
      group: "Ligaments",
      tone: "chart-5", shade: 0.16,
      description:
        "Cords that tie each ovary to the side of the uterus, just below the tube.",
    },
    {
      id: "suspensory-ligaments",
      label: "Suspensory ligaments of the ovary",
      group: "Ligaments",
      tone: "chart-5", shade: 0.12,
      description:
        "Folds that run from each ovary up to the pelvic wall and carry the ovarian vessels.",
    },
    {
      id: "round-ligaments",
      label: "Round ligaments",
      group: "Ligaments",
      tone: "chart-1", shade: 0.19,
      description:
        "Cords that run from the top corners of the uterus forward and down through the groin.",
    },
    {
      id: "cardinal-ligaments",
      label: "Cardinal ligaments",
      group: "Ligaments",
      tone: "chart-1", shade: 0.14,
      description:
        "Bands at the base of the broad ligament that anchor the cervix to the side walls of the pelvis.",
    },
    {
      id: "uterosacral-ligaments",
      label: "Uterosacral ligaments",
      group: "Ligaments",
      tone: "chart-1", shade: 0.11,
      description: "Bands that run back from the cervix to the sacrum.",
    },
    {
      id: "uterine-arteries",
      label: "Uterine arteries",
      group: "Blood vessels",
      tone: "chart-1", shade: 0.01,
      description:
        "Branches of the internal iliac arteries that reach the sides of the uterus near the cervix.",
    },
    {
      id: "uterine-veins",
      label: "Uterine veins",
      group: "Blood vessels",
      tone: "chart-4", shade: 0.05,
      description: "Drain the uterus into the internal iliac veins.",
    },
    {
      id: "bladder",
      label: "Urinary bladder",
      group: "Neighbouring structures",
      tone: "chart-2", shade: 0.13,
      description:
        "Sits in front of and below the uterus, which tips forward over it.",
    },
  ],
  attribution: {
    credit:
      "HuBMAP Human Reference Atlas 3D Reference Object Library (Kristen Browne, Heidi Schlehlein et al.), CC BY 4.0. Adapted by OrganUI.",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    source:
      "https://github.com/organui/uterus-3d/blob/404a6039b2d667e2b4e08ae71d4964cd9b963cf1/public/models/ATTRIBUTION.md",
  },
}

export type UterusProps = Omit<OrganViewerProps, "model">

export function Uterus(props: UterusProps) {
  return <OrganViewer model={uterusModel} {...props} />
}
