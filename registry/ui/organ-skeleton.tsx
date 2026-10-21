import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/skeleton-3d at 120fc17. The GLB stays in that
// repository under its own licence; see attribution.source.
export const skeletonModel: OrganModel = {
  name: "Skeleton",
  src: "https://cdn.jsdelivr.net/gh/organui/skeleton-3d@120fc17278559057b37aff516eee89d263b604c6/public/models/skeleton.glb",
  bytes: 5221116,
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
      name: "Right lateral",
      direction: [-1, 0, 0],
    },
    {
      name: "Skull",
      direction: [-0.55, 0.1, 1],
      structureIds: [
        "frontal-bone",
        "right-parietal-bone",
        "left-parietal-bone",
        "occipital-bone",
        "right-temporal-bone",
        "left-temporal-bone",
        "sphenoid-bone",
        "ethmoid-bone",
        "right-nasal-bone",
        "right-lacrimal-bone",
        "right-zygomatic-bone",
        "right-maxilla",
        "right-palatine-bone",
        "right-inferior-nasal-concha",
        "left-nasal-bone",
        "left-lacrimal-bone",
        "left-zygomatic-bone",
        "left-maxilla",
        "left-palatine-bone",
        "left-inferior-nasal-concha",
        "vomer",
        "mandible",
        "hyoid-bone",
      ],
    },
    {
      name: "Thorax",
      direction: [0, 0.15, 1],
      structureIds: [
        "manubrium-of-sternum",
        "body-of-sternum",
        "xiphoid-process",
        "right-first-rib",
        "right-second-rib",
        "right-third-rib",
        "right-fourth-rib",
        "right-fifth-rib",
        "right-sixth-rib",
        "right-seventh-rib",
        "right-eighth-rib",
        "right-ninth-rib",
        "right-tenth-rib",
        "right-eleventh-rib",
        "right-twelfth-rib",
        "left-first-rib",
        "left-second-rib",
        "left-third-rib",
        "left-fourth-rib",
        "left-fifth-rib",
        "left-sixth-rib",
        "left-seventh-rib",
        "left-eighth-rib",
        "left-ninth-rib",
        "left-tenth-rib",
        "left-eleventh-rib",
        "left-twelfth-rib",
        "right-first-costal-cartilage",
        "right-second-costal-cartilage",
        "right-third-costal-cartilage",
        "right-fourth-costal-cartilage",
        "right-fifth-costal-cartilage",
        "right-sixth-costal-cartilage",
        "right-seventh-costal-cartilage",
        "right-lower-costal-cartilages",
        "left-first-costal-cartilage",
        "left-second-costal-cartilage",
        "left-third-costal-cartilage",
        "left-fourth-costal-cartilage",
        "left-fifth-costal-cartilage",
        "left-sixth-costal-cartilage",
        "left-seventh-costal-cartilage",
        "left-lower-costal-cartilages",
      ],
    },
    {
      name: "Spine",
      direction: [-0.45, 0, -1],
      structureIds: [
        "atlas-c1",
        "axis-c2",
        "third-cervical-vertebra-c3",
        "fourth-cervical-vertebra-c4",
        "fifth-cervical-vertebra-c5",
        "sixth-cervical-vertebra-c6",
        "seventh-cervical-vertebra-c7",
        "first-thoracic-vertebra-t1",
        "second-thoracic-vertebra-t2",
        "third-thoracic-vertebra-t3",
        "fourth-thoracic-vertebra-t4",
        "fifth-thoracic-vertebra-t5",
        "sixth-thoracic-vertebra-t6",
        "seventh-thoracic-vertebra-t7",
        "eighth-thoracic-vertebra-t8",
        "ninth-thoracic-vertebra-t9",
        "tenth-thoracic-vertebra-t10",
        "eleventh-thoracic-vertebra-t11",
        "twelfth-thoracic-vertebra-t12",
        "first-lumbar-vertebra-l1",
        "second-lumbar-vertebra-l2",
        "third-lumbar-vertebra-l3",
        "fourth-lumbar-vertebra-l4",
        "fifth-lumbar-vertebra-l5",
        "sacrum",
        "intervertebral-disc-c2-c3",
        "intervertebral-disc-c3-c4",
        "intervertebral-disc-c4-c5",
        "intervertebral-disc-c5-c6",
        "intervertebral-disc-c6-c7",
        "intervertebral-disc-c7-t1",
        "intervertebral-disc-t1-t2",
        "intervertebral-disc-t2-t3",
        "intervertebral-disc-t3-t4",
        "intervertebral-disc-t4-t5",
        "intervertebral-disc-t5-t6",
        "intervertebral-disc-t6-t7",
        "intervertebral-disc-t7-t8",
        "intervertebral-disc-t8-t9",
        "intervertebral-disc-t9-t10",
        "intervertebral-disc-t10-t11",
        "intervertebral-disc-t11-t12",
        "intervertebral-disc-t12-l1",
        "intervertebral-disc-l1-l2",
        "intervertebral-disc-l2-l3",
        "intervertebral-disc-l3-l4",
        "intervertebral-disc-l4-l5",
        "intervertebral-disc-l5-s1",
      ],
    },
    {
      name: "Right hand",
      direction: [0, 0, 1],
      structureIds: [
        "right-scaphoid",
        "right-lunate",
        "right-triquetral",
        "right-pisiform",
        "right-trapezium",
        "right-trapezoid",
        "right-capitate",
        "right-hamate",
        "right-first-metacarpal-bone",
        "right-second-metacarpal-bone",
        "right-third-metacarpal-bone",
        "right-fourth-metacarpal-bone",
        "right-fifth-metacarpal-bone",
        "right-thumb-proximal-phalanx",
        "right-index-finger-proximal-phalanx",
        "right-middle-finger-proximal-phalanx",
        "right-ring-finger-proximal-phalanx",
        "right-little-finger-proximal-phalanx",
        "right-index-finger-middle-phalanx",
        "right-middle-finger-middle-phalanx",
        "right-ring-finger-middle-phalanx",
        "right-little-finger-middle-phalanx",
        "right-thumb-distal-phalanx",
        "right-index-finger-distal-phalanx",
        "right-middle-finger-distal-phalanx",
        "right-ring-finger-distal-phalanx",
        "right-little-finger-distal-phalanx",
      ],
    },
    {
      name: "Right foot",
      direction: [-0.6, 0.8, 0.9],
      structureIds: [
        "right-talus",
        "right-calcaneus",
        "right-navicular",
        "right-cuboid",
        "right-medial-cuneiform",
        "right-intermediate-cuneiform",
        "right-lateral-cuneiform",
        "right-first-metatarsal-bone",
        "right-second-metatarsal-bone",
        "right-third-metatarsal-bone",
        "right-fourth-metatarsal-bone",
        "right-fifth-metatarsal-bone",
        "right-big-toe-proximal-phalanx",
        "right-second-toe-proximal-phalanx",
        "right-third-toe-proximal-phalanx",
        "right-fourth-toe-proximal-phalanx",
        "right-little-toe-proximal-phalanx",
        "right-second-toe-middle-phalanx",
        "right-third-toe-middle-phalanx",
        "right-fourth-toe-middle-phalanx",
        "right-little-toe-middle-phalanx",
        "right-big-toe-distal-phalanx",
        "right-second-toe-distal-phalanx",
        "right-third-toe-distal-phalanx",
        "right-fourth-toe-distal-phalanx",
        "right-little-toe-distal-phalanx",
        "right-sesamoid-bones-of-the-foot",
      ],
    },
  ],
  structures: [
    {
      id: "frontal-bone",
      label: "Frontal bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description:
        "Forms the forehead, the roofs of the eye sockets and the front of the cranial vault.",
    },
    {
      id: "right-parietal-bone",
      label: "Right parietal bone",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "One of a pair of curved plates forming the top and upper sides of the cranial vault, joined at the sagittal suture.",
    },
    {
      id: "left-parietal-bone",
      label: "Left parietal bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description:
        "One of a pair of curved plates forming the top and upper sides of the cranial vault, joined at the sagittal suture.",
    },
    {
      id: "occipital-bone",
      label: "Occipital bone",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "Forms the back and base of the skull. The spinal cord passes through its large opening, the foramen magnum, and its condyles rest on the atlas.",
    },
    {
      id: "right-temporal-bone",
      label: "Right temporal bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description:
        "Forms the lower side of the skull. It houses the middle and inner ear and forms the socket of the jaw joint.",
    },
    {
      id: "left-temporal-bone",
      label: "Left temporal bone",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "Forms the lower side of the skull. It houses the middle and inner ear and forms the socket of the jaw joint.",
    },
    {
      id: "sphenoid-bone",
      label: "Sphenoid bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description:
        "A butterfly-shaped bone across the middle of the skull base. It links the cranial and facial bones and cradles the pituitary gland.",
    },
    {
      id: "ethmoid-bone",
      label: "Ethmoid bone",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "A light, air-filled bone between the eye sockets. It forms part of the nasal cavity and the floor of the front of the cranium.",
    },
    {
      id: "right-nasal-bone",
      label: "Right nasal bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description: "One of two small bones forming the bridge of the nose.",
    },
    {
      id: "right-lacrimal-bone",
      label: "Right lacrimal bone",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "The smallest facial bone, in the inner wall of the eye socket. It holds the groove for the tear sac.",
    },
    {
      id: "right-zygomatic-bone",
      label: "Right zygomatic bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description:
        "The cheekbone. It forms the prominence of the cheek and part of the outer wall and floor of the eye socket.",
    },
    {
      id: "right-maxilla",
      label: "Right maxilla",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "One half of the upper jaw. It holds the upper teeth and forms most of the hard palate and the floor of the eye socket.",
    },
    {
      id: "right-palatine-bone",
      label: "Right palatine bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description:
        "An L-shaped bone forming the back of the hard palate and part of the nasal cavity wall.",
    },
    {
      id: "right-inferior-nasal-concha",
      label: "Right inferior nasal concha",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "A thin, scroll-shaped bone on the side wall of the nasal cavity that helps warm and moisten inhaled air.",
    },
    {
      id: "left-nasal-bone",
      label: "Left nasal bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description: "One of two small bones forming the bridge of the nose.",
    },
    {
      id: "left-lacrimal-bone",
      label: "Left lacrimal bone",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "The smallest facial bone, in the inner wall of the eye socket. It holds the groove for the tear sac.",
    },
    {
      id: "left-zygomatic-bone",
      label: "Left zygomatic bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description:
        "The cheekbone. It forms the prominence of the cheek and part of the outer wall and floor of the eye socket.",
    },
    {
      id: "left-maxilla",
      label: "Left maxilla",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "One half of the upper jaw. It holds the upper teeth and forms most of the hard palate and the floor of the eye socket.",
    },
    {
      id: "left-palatine-bone",
      label: "Left palatine bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description:
        "An L-shaped bone forming the back of the hard palate and part of the nasal cavity wall.",
    },
    {
      id: "left-inferior-nasal-concha",
      label: "Left inferior nasal concha",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "A thin, scroll-shaped bone on the side wall of the nasal cavity that helps warm and moisten inhaled air.",
    },
    {
      id: "vomer",
      label: "Vomer",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description:
        "A thin plate forming the back and lower part of the nasal septum.",
    },
    {
      id: "mandible",
      label: "Mandible",
      group: "Skull",
      tone: "chart-2", shade: 0.19,
      description:
        "The lower jaw, the only movable bone of the skull. It holds the lower teeth and hinges at the temporal bones.",
    },
    {
      id: "hyoid-bone",
      label: "Hyoid bone",
      group: "Skull",
      tone: "chart-2", shade: 0.24,
      description:
        "A U-shaped bone in the neck that touches no other bone. It anchors the tongue and the muscles used in swallowing.",
    },
    {
      id: "atlas-c1",
      label: "Atlas (C1)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "The first cervical vertebra. A ring of bone with no body, it carries the skull and lets the head nod.",
    },
    {
      id: "axis-c2",
      label: "Axis (C2)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "The second cervical vertebra. Its upward peg, the dens, is the pivot the atlas and head turn around.",
    },
    {
      id: "third-cervical-vertebra-c3",
      label: "Third cervical vertebra (C3)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "A small neck vertebra. Openings in its transverse processes carry the vertebral arteries up to the brain.",
    },
    {
      id: "fourth-cervical-vertebra-c4",
      label: "Fourth cervical vertebra (C4)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A small neck vertebra. Openings in its transverse processes carry the vertebral arteries up to the brain.",
    },
    {
      id: "fifth-cervical-vertebra-c5",
      label: "Fifth cervical vertebra (C5)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "A small neck vertebra. Openings in its transverse processes carry the vertebral arteries up to the brain.",
    },
    {
      id: "sixth-cervical-vertebra-c6",
      label: "Sixth cervical vertebra (C6)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A small neck vertebra. Openings in its transverse processes carry the vertebral arteries up to the brain.",
    },
    {
      id: "seventh-cervical-vertebra-c7",
      label: "Seventh cervical vertebra (C7)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "The lowest neck vertebra. Its long spinous process is the bump you can feel at the base of the neck.",
    },
    {
      id: "first-thoracic-vertebra-t1",
      label: "First thoracic vertebra (T1)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "second-thoracic-vertebra-t2",
      label: "Second thoracic vertebra (T2)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "third-thoracic-vertebra-t3",
      label: "Third thoracic vertebra (T3)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "fourth-thoracic-vertebra-t4",
      label: "Fourth thoracic vertebra (T4)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "fifth-thoracic-vertebra-t5",
      label: "Fifth thoracic vertebra (T5)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "sixth-thoracic-vertebra-t6",
      label: "Sixth thoracic vertebra (T6)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "seventh-thoracic-vertebra-t7",
      label: "Seventh thoracic vertebra (T7)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "eighth-thoracic-vertebra-t8",
      label: "Eighth thoracic vertebra (T8)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "ninth-thoracic-vertebra-t9",
      label: "Ninth thoracic vertebra (T9)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "tenth-thoracic-vertebra-t10",
      label: "Tenth thoracic vertebra (T10)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "eleventh-thoracic-vertebra-t11",
      label: "Eleventh thoracic vertebra (T11)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "twelfth-thoracic-vertebra-t12",
      label: "Twelfth thoracic vertebra (T12)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "A vertebra of the upper back. It has facets where the ribs attach, so the thoracic spine moves less than the neck or lower back.",
    },
    {
      id: "first-lumbar-vertebra-l1",
      label: "First lumbar vertebra (L1)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A large vertebra of the lower back. Its heavy body carries most of the weight of the upper body.",
    },
    {
      id: "second-lumbar-vertebra-l2",
      label: "Second lumbar vertebra (L2)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "A large vertebra of the lower back. Its heavy body carries most of the weight of the upper body.",
    },
    {
      id: "third-lumbar-vertebra-l3",
      label: "Third lumbar vertebra (L3)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A large vertebra of the lower back. Its heavy body carries most of the weight of the upper body.",
    },
    {
      id: "fourth-lumbar-vertebra-l4",
      label: "Fourth lumbar vertebra (L4)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "A large vertebra of the lower back. Its heavy body carries most of the weight of the upper body.",
    },
    {
      id: "fifth-lumbar-vertebra-l5",
      label: "Fifth lumbar vertebra (L5)",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.14,
      description:
        "A large vertebra of the lower back. Its heavy body carries most of the weight of the upper body.",
    },
    {
      id: "sacrum",
      label: "Sacrum",
      group: "Vertebral column",
      tone: "chart-2", shade: 0.19,
      description:
        "Five fused vertebrae forming the back of the pelvis. It joins the hip bones at the sacroiliac joints.",
    },
    {
      id: "intervertebral-disc-c2-c3",
      label: "Intervertebral disc C2–C3",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-c3-c4",
      label: "Intervertebral disc C3–C4",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-c4-c5",
      label: "Intervertebral disc C4–C5",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-c5-c6",
      label: "Intervertebral disc C5–C6",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-c6-c7",
      label: "Intervertebral disc C6–C7",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-c7-t1",
      label: "Intervertebral disc C7–T1",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t1-t2",
      label: "Intervertebral disc T1–T2",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t2-t3",
      label: "Intervertebral disc T2–T3",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t3-t4",
      label: "Intervertebral disc T3–T4",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t4-t5",
      label: "Intervertebral disc T4–T5",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t5-t6",
      label: "Intervertebral disc T5–T6",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t6-t7",
      label: "Intervertebral disc T6–T7",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t7-t8",
      label: "Intervertebral disc T7–T8",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t8-t9",
      label: "Intervertebral disc T8–T9",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t9-t10",
      label: "Intervertebral disc T9–T10",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t10-t11",
      label: "Intervertebral disc T10–T11",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t11-t12",
      label: "Intervertebral disc T11–T12",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-t12-l1",
      label: "Intervertebral disc T12–L1",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-l1-l2",
      label: "Intervertebral disc L1–L2",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-l2-l3",
      label: "Intervertebral disc L2–L3",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-l3-l4",
      label: "Intervertebral disc L3–L4",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-l4-l5",
      label: "Intervertebral disc L4–L5",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.18,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "intervertebral-disc-l5-s1",
      label: "Intervertebral disc L5–S1",
      group: "Vertebral column",
      tone: "chart-4", shade: 0.14,
      description:
        "A pad of fibrocartilage between two vertebral bodies. Its tough outer ring and soft core absorb shock and let the spine bend.",
    },
    {
      id: "manubrium-of-sternum",
      label: "Manubrium of sternum",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "The top of the breastbone. The clavicles and first ribs attach to it.",
    },
    {
      id: "body-of-sternum",
      label: "Body of sternum",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "The long middle part of the breastbone, where the second to seventh costal cartilages attach.",
    },
    {
      id: "xiphoid-process",
      label: "Xiphoid process",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "The small tip at the bottom of the breastbone. Some abdominal muscles and the diaphragm attach to it.",
    },
    {
      id: "right-first-rib",
      label: "Right first rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "right-second-rib",
      label: "Right second rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "right-third-rib",
      label: "Right third rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "right-fourth-rib",
      label: "Right fourth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "right-fifth-rib",
      label: "Right fifth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "right-sixth-rib",
      label: "Right sixth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "right-seventh-rib",
      label: "Right seventh rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "right-eighth-rib",
      label: "Right eighth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A false rib: its cartilage joins the cartilage of the rib above instead of the sternum.",
    },
    {
      id: "right-ninth-rib",
      label: "Right ninth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A false rib: its cartilage joins the cartilage of the rib above instead of the sternum.",
    },
    {
      id: "right-tenth-rib",
      label: "Right tenth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A false rib: its cartilage joins the cartilage of the rib above instead of the sternum.",
    },
    {
      id: "right-eleventh-rib",
      label: "Right eleventh rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A floating rib: it ends in the muscles of the flank without reaching the front of the chest.",
    },
    {
      id: "right-twelfth-rib",
      label: "Right twelfth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A floating rib: it ends in the muscles of the flank without reaching the front of the chest.",
    },
    {
      id: "left-first-rib",
      label: "Left first rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "left-second-rib",
      label: "Left second rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "left-third-rib",
      label: "Left third rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "left-fourth-rib",
      label: "Left fourth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "left-fifth-rib",
      label: "Left fifth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "left-sixth-rib",
      label: "Left sixth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "left-seventh-rib",
      label: "Left seventh rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A true rib: its own costal cartilage joins it directly to the sternum.",
    },
    {
      id: "left-eighth-rib",
      label: "Left eighth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A false rib: its cartilage joins the cartilage of the rib above instead of the sternum.",
    },
    {
      id: "left-ninth-rib",
      label: "Left ninth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A false rib: its cartilage joins the cartilage of the rib above instead of the sternum.",
    },
    {
      id: "left-tenth-rib",
      label: "Left tenth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A false rib: its cartilage joins the cartilage of the rib above instead of the sternum.",
    },
    {
      id: "left-eleventh-rib",
      label: "Left eleventh rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.2,
      description:
        "A floating rib: it ends in the muscles of the flank without reaching the front of the chest.",
    },
    {
      id: "left-twelfth-rib",
      label: "Left twelfth rib",
      group: "Thorax",
      tone: "chart-2", shade: 0.26,
      description:
        "A floating rib: it ends in the muscles of the flank without reaching the front of the chest.",
    },
    {
      id: "right-first-costal-cartilage",
      label: "Right first costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.14,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "right-second-costal-cartilage",
      label: "Right second costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.18,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "right-third-costal-cartilage",
      label: "Right third costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.14,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "right-fourth-costal-cartilage",
      label: "Right fourth costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.18,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "right-fifth-costal-cartilage",
      label: "Right fifth costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.14,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "right-sixth-costal-cartilage",
      label: "Right sixth costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.18,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "right-seventh-costal-cartilage",
      label: "Right seventh costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.14,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "right-lower-costal-cartilages",
      label: "Right lower costal cartilages",
      group: "Thorax",
      tone: "chart-4", shade: 0.18,
      description:
        "The cartilages of the eighth to tenth ribs, which join one another and the seventh cartilage to form the lower edge of the rib cage, the costal margin.",
    },
    {
      id: "left-first-costal-cartilage",
      label: "Left first costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.14,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "left-second-costal-cartilage",
      label: "Left second costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.18,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "left-third-costal-cartilage",
      label: "Left third costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.14,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "left-fourth-costal-cartilage",
      label: "Left fourth costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.18,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "left-fifth-costal-cartilage",
      label: "Left fifth costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.14,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "left-sixth-costal-cartilage",
      label: "Left sixth costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.18,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "left-seventh-costal-cartilage",
      label: "Left seventh costal cartilage",
      group: "Thorax",
      tone: "chart-4", shade: 0.14,
      description:
        "A bar of hyaline cartilage joining a rib to the sternum. Its flexibility lets the chest expand when you breathe.",
    },
    {
      id: "left-lower-costal-cartilages",
      label: "Left lower costal cartilages",
      group: "Thorax",
      tone: "chart-4", shade: 0.18,
      description:
        "The cartilages of the eighth to tenth ribs, which join one another and the seventh cartilage to form the lower edge of the rib cage, the costal margin.",
    },
    {
      id: "right-clavicle",
      label: "Right clavicle",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The collarbone. An S-shaped strut between the sternum and the scapula that holds the shoulder out from the chest.",
    },
    {
      id: "right-scapula",
      label: "Right scapula",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The shoulder blade. A flat triangular bone on the back of the rib cage; its shallow socket holds the head of the humerus.",
    },
    {
      id: "right-humerus",
      label: "Right humerus",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description: "The upper arm bone, from the shoulder joint to the elbow.",
    },
    {
      id: "right-radius",
      label: "Right radius",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The forearm bone on the thumb side. It rotates around the ulna to turn the palm up or down.",
    },
    {
      id: "right-ulna",
      label: "Right ulna",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The forearm bone on the little-finger side. Its hooked upper end forms the point of the elbow.",
    },
    {
      id: "right-scaphoid",
      label: "Right scaphoid",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The largest bone of the first carpal row, on the thumb side; the most commonly fractured wrist bone.",
    },
    {
      id: "right-lunate",
      label: "Right lunate",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A crescent-shaped bone in the middle of the first carpal row, between the scaphoid and triquetral.",
    },
    {
      id: "right-triquetral",
      label: "Right triquetral",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "A pyramid-shaped bone of the first carpal row on the little-finger side.",
    },
    {
      id: "right-pisiform",
      label: "Right pisiform",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A small pea-shaped bone on the front of the triquetral, inside the tendon of a wrist flexor.",
    },
    {
      id: "right-trapezium",
      label: "Right trapezium",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The carpal bone at the base of the thumb; its saddle-shaped joint gives the thumb its wide range of movement.",
    },
    {
      id: "right-trapezoid",
      label: "Right trapezoid",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A small wedge-shaped carpal bone at the base of the index finger.",
    },
    {
      id: "right-capitate",
      label: "Right capitate",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The largest carpal bone, at the centre of the wrist below the middle finger.",
    },
    {
      id: "right-hamate",
      label: "Right hamate",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A carpal bone on the little-finger side with a hook that forms one wall of the carpal tunnel.",
    },
    {
      id: "right-first-metacarpal-bone",
      label: "Right first metacarpal bone",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "A long bone of the palm leading to the thumb. Its rounded head forms a knuckle.",
    },
    {
      id: "right-second-metacarpal-bone",
      label: "Right second metacarpal bone",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A long bone of the palm leading to the index finger. Its rounded head forms a knuckle.",
    },
    {
      id: "right-third-metacarpal-bone",
      label: "Right third metacarpal bone",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "A long bone of the palm leading to the middle finger. Its rounded head forms a knuckle.",
    },
    {
      id: "right-fourth-metacarpal-bone",
      label: "Right fourth metacarpal bone",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A long bone of the palm leading to the ring finger. Its rounded head forms a knuckle.",
    },
    {
      id: "right-fifth-metacarpal-bone",
      label: "Right fifth metacarpal bone",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "A long bone of the palm leading to the little finger. Its rounded head forms a knuckle.",
    },
    {
      id: "right-thumb-proximal-phalanx",
      label: "Right thumb, proximal phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal. The thumb has only two phalanges.",
    },
    {
      id: "right-index-finger-proximal-phalanx",
      label: "Right index finger, proximal phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "right-middle-finger-proximal-phalanx",
      label: "Right middle finger, proximal phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "right-ring-finger-proximal-phalanx",
      label: "Right ring finger, proximal phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "right-little-finger-proximal-phalanx",
      label: "Right little finger, proximal phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "right-index-finger-middle-phalanx",
      label: "Right index finger, middle phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "right-middle-finger-middle-phalanx",
      label: "Right middle finger, middle phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "right-ring-finger-middle-phalanx",
      label: "Right ring finger, middle phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "right-little-finger-middle-phalanx",
      label: "Right little finger, middle phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "right-thumb-distal-phalanx",
      label: "Right thumb, distal phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail. The thumb has only two phalanges.",
    },
    {
      id: "right-index-finger-distal-phalanx",
      label: "Right index finger, distal phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "right-middle-finger-distal-phalanx",
      label: "Right middle finger, distal phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "right-ring-finger-distal-phalanx",
      label: "Right ring finger, distal phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "right-little-finger-distal-phalanx",
      label: "Right little finger, distal phalanx",
      group: "Right upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "left-clavicle",
      label: "Left clavicle",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The collarbone. An S-shaped strut between the sternum and the scapula that holds the shoulder out from the chest.",
    },
    {
      id: "left-scapula",
      label: "Left scapula",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The shoulder blade. A flat triangular bone on the back of the rib cage; its shallow socket holds the head of the humerus.",
    },
    {
      id: "left-humerus",
      label: "Left humerus",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description: "The upper arm bone, from the shoulder joint to the elbow.",
    },
    {
      id: "left-radius",
      label: "Left radius",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The forearm bone on the thumb side. It rotates around the ulna to turn the palm up or down.",
    },
    {
      id: "left-ulna",
      label: "Left ulna",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The forearm bone on the little-finger side. Its hooked upper end forms the point of the elbow.",
    },
    {
      id: "left-scaphoid",
      label: "Left scaphoid",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The largest bone of the first carpal row, on the thumb side; the most commonly fractured wrist bone.",
    },
    {
      id: "left-lunate",
      label: "Left lunate",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A crescent-shaped bone in the middle of the first carpal row, between the scaphoid and triquetral.",
    },
    {
      id: "left-triquetral",
      label: "Left triquetral",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "A pyramid-shaped bone of the first carpal row on the little-finger side.",
    },
    {
      id: "left-pisiform",
      label: "Left pisiform",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A small pea-shaped bone on the front of the triquetral, inside the tendon of a wrist flexor.",
    },
    {
      id: "left-trapezium",
      label: "Left trapezium",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The carpal bone at the base of the thumb; its saddle-shaped joint gives the thumb its wide range of movement.",
    },
    {
      id: "left-trapezoid",
      label: "Left trapezoid",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A small wedge-shaped carpal bone at the base of the index finger.",
    },
    {
      id: "left-capitate",
      label: "Left capitate",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The largest carpal bone, at the centre of the wrist below the middle finger.",
    },
    {
      id: "left-hamate",
      label: "Left hamate",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A carpal bone on the little-finger side with a hook that forms one wall of the carpal tunnel.",
    },
    {
      id: "left-first-metacarpal-bone",
      label: "Left first metacarpal bone",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "A long bone of the palm leading to the thumb. Its rounded head forms a knuckle.",
    },
    {
      id: "left-second-metacarpal-bone",
      label: "Left second metacarpal bone",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A long bone of the palm leading to the index finger. Its rounded head forms a knuckle.",
    },
    {
      id: "left-third-metacarpal-bone",
      label: "Left third metacarpal bone",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "A long bone of the palm leading to the middle finger. Its rounded head forms a knuckle.",
    },
    {
      id: "left-fourth-metacarpal-bone",
      label: "Left fourth metacarpal bone",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "A long bone of the palm leading to the ring finger. Its rounded head forms a knuckle.",
    },
    {
      id: "left-fifth-metacarpal-bone",
      label: "Left fifth metacarpal bone",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "A long bone of the palm leading to the little finger. Its rounded head forms a knuckle.",
    },
    {
      id: "left-thumb-proximal-phalanx",
      label: "Left thumb, proximal phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal. The thumb has only two phalanges.",
    },
    {
      id: "left-index-finger-proximal-phalanx",
      label: "Left index finger, proximal phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "left-middle-finger-proximal-phalanx",
      label: "Left middle finger, proximal phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "left-ring-finger-proximal-phalanx",
      label: "Left ring finger, proximal phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "left-little-finger-proximal-phalanx",
      label: "Left little finger, proximal phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "left-index-finger-middle-phalanx",
      label: "Left index finger, middle phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "left-middle-finger-middle-phalanx",
      label: "Left middle finger, middle phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "left-ring-finger-middle-phalanx",
      label: "Left ring finger, middle phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "left-little-finger-middle-phalanx",
      label: "Left little finger, middle phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "left-thumb-distal-phalanx",
      label: "Left thumb, distal phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail. The thumb has only two phalanges.",
    },
    {
      id: "left-index-finger-distal-phalanx",
      label: "Left index finger, distal phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "left-middle-finger-distal-phalanx",
      label: "Left middle finger, distal phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "left-ring-finger-distal-phalanx",
      label: "Left ring finger, distal phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.22,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "left-little-finger-distal-phalanx",
      label: "Left little finger, distal phalanx",
      group: "Left upper limb",
      tone: "chart-2", shade: 0.17,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "right-hip-bone",
      label: "Right hip bone",
      group: "Pelvis",
      tone: "chart-2", shade: 0.18,
      description:
        "Formed by the ilium, ischium and pubis fused together. It carries the hip socket and joins the sacrum behind and the other hip bone in front.",
    },
    {
      id: "left-hip-bone",
      label: "Left hip bone",
      group: "Pelvis",
      tone: "chart-2", shade: 0.13,
      description:
        "Formed by the ilium, ischium and pubis fused together. It carries the hip socket and joins the sacrum behind and the other hip bone in front.",
    },
    {
      id: "right-femur",
      label: "Right femur",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The thigh bone, the longest and strongest bone in the body. Its ball-shaped head fits the hip socket.",
    },
    {
      id: "right-patella",
      label: "Right patella",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The kneecap, a sesamoid bone inside the quadriceps tendon that protects the knee and improves the muscle’s leverage.",
    },
    {
      id: "right-tibia",
      label: "Right tibia",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The shinbone. The larger lower-leg bone, it carries the body’s weight from the knee to the ankle.",
    },
    {
      id: "right-fibula",
      label: "Right fibula",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The slender outer bone of the lower leg. It anchors muscles and forms the outer ankle bump.",
    },
    {
      id: "right-talus",
      label: "Right talus",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The ankle bone that sits between the tibia, fibula and calcaneus, transferring weight from the leg to the foot.",
    },
    {
      id: "right-calcaneus",
      label: "Right calcaneus",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The heel bone, the largest bone of the foot. The Achilles tendon attaches to its back.",
    },
    {
      id: "right-navicular",
      label: "Right navicular",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "A boat-shaped bone on the inner side of the foot, in front of the talus.",
    },
    {
      id: "right-cuboid",
      label: "Right cuboid",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "A cube-shaped bone on the outer side of the foot, in front of the calcaneus.",
    },
    {
      id: "right-medial-cuneiform",
      label: "Right medial cuneiform",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The largest of the three wedge-shaped cuneiform bones, at the base of the big toe’s metatarsal.",
    },
    {
      id: "right-intermediate-cuneiform",
      label: "Right intermediate cuneiform",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The smallest cuneiform bone, at the base of the second metatarsal.",
    },
    {
      id: "right-lateral-cuneiform",
      label: "Right lateral cuneiform",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The cuneiform bone at the base of the third metatarsal, beside the cuboid.",
    },
    {
      id: "right-first-metatarsal-bone",
      label: "Right first metatarsal bone",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "A long bone of the foot leading to the big toe. The metatarsal heads form the ball of the foot.",
    },
    {
      id: "right-second-metatarsal-bone",
      label: "Right second metatarsal bone",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "A long bone of the foot leading to the second toe. The metatarsal heads form the ball of the foot.",
    },
    {
      id: "right-third-metatarsal-bone",
      label: "Right third metatarsal bone",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "A long bone of the foot leading to the third toe. The metatarsal heads form the ball of the foot.",
    },
    {
      id: "right-fourth-metatarsal-bone",
      label: "Right fourth metatarsal bone",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "A long bone of the foot leading to the fourth toe. The metatarsal heads form the ball of the foot.",
    },
    {
      id: "right-fifth-metatarsal-bone",
      label: "Right fifth metatarsal bone",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "A long bone of the foot leading to the little toe. The metatarsal heads form the ball of the foot.",
    },
    {
      id: "right-big-toe-proximal-phalanx",
      label: "Right big toe, proximal phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal. The big toe has only two phalanges.",
    },
    {
      id: "right-second-toe-proximal-phalanx",
      label: "Right second toe, proximal phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "right-third-toe-proximal-phalanx",
      label: "Right third toe, proximal phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "right-fourth-toe-proximal-phalanx",
      label: "Right fourth toe, proximal phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "right-little-toe-proximal-phalanx",
      label: "Right little toe, proximal phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "right-second-toe-middle-phalanx",
      label: "Right second toe, middle phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "right-third-toe-middle-phalanx",
      label: "Right third toe, middle phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "right-fourth-toe-middle-phalanx",
      label: "Right fourth toe, middle phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "right-little-toe-middle-phalanx",
      label: "Right little toe, middle phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "right-big-toe-distal-phalanx",
      label: "Right big toe, distal phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail. The big toe has only two phalanges.",
    },
    {
      id: "right-second-toe-distal-phalanx",
      label: "Right second toe, distal phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "right-third-toe-distal-phalanx",
      label: "Right third toe, distal phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "right-fourth-toe-distal-phalanx",
      label: "Right fourth toe, distal phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "right-little-toe-distal-phalanx",
      label: "Right little toe, distal phalanx",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "right-sesamoid-bones-of-the-foot",
      label: "Right sesamoid bones of the foot",
      group: "Right lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "Small bones embedded in tendons under the head of the first metatarsal. They protect the tendons and help the big toe push off.",
    },
    {
      id: "left-femur",
      label: "Left femur",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The thigh bone, the longest and strongest bone in the body. Its ball-shaped head fits the hip socket.",
    },
    {
      id: "left-patella",
      label: "Left patella",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The kneecap, a sesamoid bone inside the quadriceps tendon that protects the knee and improves the muscle’s leverage.",
    },
    {
      id: "left-tibia",
      label: "Left tibia",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The shinbone. The larger lower-leg bone, it carries the body’s weight from the knee to the ankle.",
    },
    {
      id: "left-fibula",
      label: "Left fibula",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The slender outer bone of the lower leg. It anchors muscles and forms the outer ankle bump.",
    },
    {
      id: "left-talus",
      label: "Left talus",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The ankle bone that sits between the tibia, fibula and calcaneus, transferring weight from the leg to the foot.",
    },
    {
      id: "left-calcaneus",
      label: "Left calcaneus",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The heel bone, the largest bone of the foot. The Achilles tendon attaches to its back.",
    },
    {
      id: "left-navicular",
      label: "Left navicular",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "A boat-shaped bone on the inner side of the foot, in front of the talus.",
    },
    {
      id: "left-cuboid",
      label: "Left cuboid",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "A cube-shaped bone on the outer side of the foot, in front of the calcaneus.",
    },
    {
      id: "left-medial-cuneiform",
      label: "Left medial cuneiform",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The largest of the three wedge-shaped cuneiform bones, at the base of the big toe’s metatarsal.",
    },
    {
      id: "left-intermediate-cuneiform",
      label: "Left intermediate cuneiform",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The smallest cuneiform bone, at the base of the second metatarsal.",
    },
    {
      id: "left-lateral-cuneiform",
      label: "Left lateral cuneiform",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The cuneiform bone at the base of the third metatarsal, beside the cuboid.",
    },
    {
      id: "left-first-metatarsal-bone",
      label: "Left first metatarsal bone",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "A long bone of the foot leading to the big toe. The metatarsal heads form the ball of the foot.",
    },
    {
      id: "left-second-metatarsal-bone",
      label: "Left second metatarsal bone",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "A long bone of the foot leading to the second toe. The metatarsal heads form the ball of the foot.",
    },
    {
      id: "left-third-metatarsal-bone",
      label: "Left third metatarsal bone",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "A long bone of the foot leading to the third toe. The metatarsal heads form the ball of the foot.",
    },
    {
      id: "left-fourth-metatarsal-bone",
      label: "Left fourth metatarsal bone",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "A long bone of the foot leading to the fourth toe. The metatarsal heads form the ball of the foot.",
    },
    {
      id: "left-fifth-metatarsal-bone",
      label: "Left fifth metatarsal bone",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "A long bone of the foot leading to the little toe. The metatarsal heads form the ball of the foot.",
    },
    {
      id: "left-big-toe-proximal-phalanx",
      label: "Left big toe, proximal phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal. The big toe has only two phalanges.",
    },
    {
      id: "left-second-toe-proximal-phalanx",
      label: "Left second toe, proximal phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "left-third-toe-proximal-phalanx",
      label: "Left third toe, proximal phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "left-fourth-toe-proximal-phalanx",
      label: "Left fourth toe, proximal phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "left-little-toe-proximal-phalanx",
      label: "Left little toe, proximal phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The phalanx nearest the palm or sole, hinged to a metacarpal or metatarsal.",
    },
    {
      id: "left-second-toe-middle-phalanx",
      label: "Left second toe, middle phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "left-third-toe-middle-phalanx",
      label: "Left third toe, middle phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "left-fourth-toe-middle-phalanx",
      label: "Left fourth toe, middle phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "left-little-toe-middle-phalanx",
      label: "Left little toe, middle phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The middle of the three phalanges of a finger or lesser toe.",
    },
    {
      id: "left-big-toe-distal-phalanx",
      label: "Left big toe, distal phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail. The big toe has only two phalanges.",
    },
    {
      id: "left-second-toe-distal-phalanx",
      label: "Left second toe, distal phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "left-third-toe-distal-phalanx",
      label: "Left third toe, distal phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "left-fourth-toe-distal-phalanx",
      label: "Left fourth toe, distal phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "left-little-toe-distal-phalanx",
      label: "Left little toe, distal phalanx",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.18,
      description:
        "The fingertip or toe-tip bone. Its flattened end supports the nail.",
    },
    {
      id: "left-sesamoid-bones-of-the-foot",
      label: "Left sesamoid bones of the foot",
      group: "Left lower limb",
      tone: "chart-2", shade: 0.23,
      description:
        "Small bones embedded in tendons under the head of the first metatarsal. They protect the tendons and help the big toe push off.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/skeleton-3d/blob/120fc17278559057b37aff516eee89d263b604c6/public/models/ATTRIBUTION.md",
  },
}

export type SkeletonProps = Omit<OrganViewerProps, "model">

export function Skeleton(props: SkeletonProps) {
  return <OrganViewer model={skeletonModel} {...props} />
}
