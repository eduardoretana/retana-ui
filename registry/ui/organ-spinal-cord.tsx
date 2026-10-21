import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/spinal-cord-3d at 3e26f98. The GLB stays in that
// repository under its own licence; see attribution.source.
export const spinalCordModel: OrganModel = {
  name: "Spinal cord",
  src: "https://cdn.jsdelivr.net/gh/organui/spinal-cord-3d@3e26f98b847fcdf5c920e62eb622174e9de7b297/public/models/spinal-cord.glb",
  bytes: 5104752,
  defaultView: "Left lateral",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Left lateral",
      direction: [1, 0, 0],
    },
    {
      name: "Posterior",
      direction: [0, 0, -1],
    },
  ],
  structures: [
    {
      id: "spinal-cord",
      label: "Spinal cord",
      group: "Cord and brainstem",
      tone: "chart-2", shade: 0.12,
      description:
        "A column of nerve tissue that carries signals between the brain and the body. It runs inside the vertebral canal from the skull to about the first lumbar vertebra.",
    },
    {
      id: "medulla-oblongata",
      label: "Medulla oblongata",
      group: "Cord and brainstem",
      tone: "chart-2", shade: 0.11,
      description:
        "The lowest part of the brainstem. It continues into the spinal cord at the opening in the base of the skull.",
    },
    {
      id: "nerve-c1",
      label: "C1 spinal nerve (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.05,
      description:
        "Leaves the spinal cord between the skull and the atlas. It mostly supplies small muscles at the top of the neck.",
    },
    {
      id: "nerve-c2",
      label: "C2 spinal nerve (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.12,
      description:
        "Leaves the spinal canal through the opening above the C2 vertebra and carries signals to and from the neck, shoulder and arm.",
    },
    {
      id: "nerve-c3",
      label: "C3 spinal nerve (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.05,
      description:
        "Leaves the spinal canal through the opening above the C3 vertebra and carries signals to and from the neck, shoulder and arm.",
    },
    {
      id: "nerve-c4",
      label: "C4 spinal nerve (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.12,
      description:
        "Leaves between the third and fourth cervical vertebrae. With C3 and C5 it forms the phrenic nerve, which works the diaphragm.",
    },
    {
      id: "nerve-c5",
      label: "C5 spinal nerve (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.05,
      description:
        "Leaves the spinal canal through the opening above the C5 vertebra and carries signals to and from the neck, shoulder and arm.",
    },
    {
      id: "nerve-c6",
      label: "C6 spinal nerve (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.12,
      description:
        "Leaves the spinal canal through the opening above the C6 vertebra and carries signals to and from the neck, shoulder and arm.",
    },
    {
      id: "nerve-c7",
      label: "C7 spinal nerve (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.05,
      description:
        "Leaves the spinal canal through the opening above the C7 vertebra and carries signals to and from the neck, shoulder and arm.",
    },
    {
      id: "nerve-c8",
      label: "C8 spinal nerve (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.12,
      description:
        "There are eight cervical nerves but only seven cervical vertebrae, so C8 leaves below C7, above T1.",
    },
    {
      id: "nerve-t1",
      label: "T1 spinal nerve (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.05,
      description:
        "Leaves the spinal canal below the T1 vertebra. Its branches run along the ribs and also join the nerves of the arm.",
    },
    {
      id: "nerve-t2",
      label: "T2 spinal nerve (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.12,
      description:
        "Leaves the spinal canal below the T2 vertebra. Its branches run along the ribs and also join the nerves of the arm.",
    },
    {
      id: "brachial-plexus",
      label: "Brachial plexus (left)",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.02,
      description:
        "A network formed by the C5 to T1 nerves. Its trunks and cords regroup the fibres into the nerves of the shoulder and arm.",
    },
    {
      id: "cauda-equina",
      label: "Cauda equina",
      group: "Spinal nerves",
      tone: "chart-2", shade: 0.19,
      description:
        "The bundle of nerve roots below the end of the cord. Its name means horse’s tail. The roots run down the canal to leave at the lumbar and sacral levels.",
    },
    {
      id: "vertebra-c1",
      label: "Atlas (C1)",
      group: "Cervical vertebrae",
      tone: "chart-2", shade: 0.19,
      description:
        "The first vertebra. It is a ring with no body and holds up the skull; the head nods on it.",
    },
    {
      id: "vertebra-c2",
      label: "Axis (C2)",
      group: "Cervical vertebrae",
      tone: "chart-2", shade: 0.13,
      description:
        "The second vertebra. Its upward peg, the dens, lets the atlas and head turn from side to side.",
    },
    {
      id: "vertebra-c3",
      label: "C3 vertebra",
      group: "Cervical vertebrae",
      tone: "chart-2", shade: 0.19,
      description:
        "A neck vertebra. Its small body carries the head, and openings in its transverse processes let the vertebral artery pass.",
    },
    {
      id: "vertebra-c4",
      label: "C4 vertebra",
      group: "Cervical vertebrae",
      tone: "chart-2", shade: 0.13,
      description:
        "A neck vertebra. Its small body carries the head, and openings in its transverse processes let the vertebral artery pass.",
    },
    {
      id: "vertebra-c5",
      label: "C5 vertebra",
      group: "Cervical vertebrae",
      tone: "chart-2", shade: 0.19,
      description:
        "A neck vertebra. Its small body carries the head, and openings in its transverse processes let the vertebral artery pass.",
    },
    {
      id: "vertebra-c6",
      label: "C6 vertebra",
      group: "Cervical vertebrae",
      tone: "chart-2", shade: 0.13,
      description:
        "A neck vertebra. Its small body carries the head, and openings in its transverse processes let the vertebral artery pass.",
    },
    {
      id: "vertebra-c7",
      label: "C7 vertebra",
      group: "Cervical vertebrae",
      tone: "chart-2", shade: 0.19,
      description:
        "The lowest neck vertebra. Its long spinous process is the bump you can feel at the base of the neck.",
    },
    {
      id: "vertebra-t1",
      label: "T1 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.11,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t2",
      label: "T2 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.17,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t3",
      label: "T3 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.11,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t4",
      label: "T4 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.17,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t5",
      label: "T5 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.11,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t6",
      label: "T6 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.17,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t7",
      label: "T7 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.11,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t8",
      label: "T8 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.17,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t9",
      label: "T9 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.11,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t10",
      label: "T10 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.17,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t11",
      label: "T11 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.11,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-t12",
      label: "T12 vertebra",
      group: "Thoracic vertebrae",
      tone: "chart-2", shade: 0.17,
      description:
        "A vertebra of the upper back. Ribs attach to its sides, and its long spinous process slopes downward.",
    },
    {
      id: "vertebra-l1",
      label: "L1 vertebra",
      group: "Lumbar vertebrae and sacrum",
      tone: "chart-2", shade: 0.09,
      description:
        "A vertebra of the lower back. Its large body carries most of the weight of the upper body.",
    },
    {
      id: "vertebra-l2",
      label: "L2 vertebra",
      group: "Lumbar vertebrae and sacrum",
      tone: "chart-2", shade: 0.16,
      description:
        "A vertebra of the lower back. Its large body carries most of the weight of the upper body.",
    },
    {
      id: "vertebra-l3",
      label: "L3 vertebra",
      group: "Lumbar vertebrae and sacrum",
      tone: "chart-2", shade: 0.09,
      description:
        "A vertebra of the lower back. Its large body carries most of the weight of the upper body.",
    },
    {
      id: "vertebra-l4",
      label: "L4 vertebra",
      group: "Lumbar vertebrae and sacrum",
      tone: "chart-2", shade: 0.16,
      description:
        "A vertebra of the lower back. Its large body carries most of the weight of the upper body.",
    },
    {
      id: "vertebra-l5",
      label: "L5 vertebra",
      group: "Lumbar vertebrae and sacrum",
      tone: "chart-2", shade: 0.09,
      description:
        "A vertebra of the lower back. Its large body carries most of the weight of the upper body.",
    },
    {
      id: "sacrum",
      label: "Sacrum",
      group: "Lumbar vertebrae and sacrum",
      tone: "chart-2", shade: 0.13,
      description:
        "Five vertebrae fused into one triangular bone at the back of the pelvis. The lowest nerve roots leave through its openings.",
    },
    {
      id: "disc-c2-c3",
      label: "C2–C3 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the C2 and C3 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-c3-c4",
      label: "C3–C4 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the C3 and C4 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-c4-c5",
      label: "C4–C5 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the C4 and C5 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-c5-c6",
      label: "C5–C6 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the C5 and C6 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-c6-c7",
      label: "C6–C7 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the C6 and C7 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-c7-t1",
      label: "C7–T1 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the C7 and T1 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t1-t2",
      label: "T1–T2 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the T1 and T2 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t2-t3",
      label: "T2–T3 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the T2 and T3 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t3-t4",
      label: "T3–T4 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the T3 and T4 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t4-t5",
      label: "T4–T5 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the T4 and T5 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t5-t6",
      label: "T5–T6 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the T5 and T6 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t6-t7",
      label: "T6–T7 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the T6 and T7 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t7-t8",
      label: "T7–T8 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the T7 and T8 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t8-t9",
      label: "T8–T9 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the T8 and T9 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t9-t10",
      label: "T9–T10 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the T9 and T10 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t10-t11",
      label: "T10–T11 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the T10 and T11 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t11-t12",
      label: "T11–T12 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the T11 and T12 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-t12-l1",
      label: "T12–L1 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the T12 and L1 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-l1-l2",
      label: "L1–L2 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the L1 and L2 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-l2-l3",
      label: "L2–L3 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the L2 and L3 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-l3-l4",
      label: "L3–L4 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "A cushion of fibrocartilage between the L3 and L4 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-l4-l5",
      label: "L4–L5 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.17,
      description:
        "A cushion of fibrocartilage between the L4 and L5 vertebral bodies. It absorbs shock and lets the spine bend.",
    },
    {
      id: "disc-l5-s1",
      label: "L5–S1 disc",
      group: "Intervertebral discs",
      tone: "chart-4", shade: 0.1,
      description:
        "The lowest disc, between the last lumbar vertebra and the sacrum. It carries the greatest load of any disc.",
    },
    {
      id: "vertebral-arteries",
      label: "Vertebral arteries",
      group: "Vessels",
      tone: "chart-1", shade: 0.01,
      description:
        "Two arteries that climb through openings in the cervical vertebrae and enter the skull, where they help supply the brainstem and the top of the spinal cord.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/spinal-cord-3d/blob/3e26f98b847fcdf5c920e62eb622174e9de7b297/public/models/ATTRIBUTION.md",
  },
}

export type SpinalCordProps = Omit<OrganViewerProps, "model">

export function SpinalCord(props: SpinalCordProps) {
  return <OrganViewer model={spinalCordModel} {...props} />
}
