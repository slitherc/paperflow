// Minimal line-icon set (lucide-style)
const Icon = ({ d, size = 18, stroke = 2, children, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children || <path d={d} />}
  </svg>
);

const IconMerge = (p) => (
  <Icon {...p}>
    <path d="M8 6v12" />
    <path d="M16 6v12" />
    <path d="M3 12h7l2-2 2 2h7" />
  </Icon>
);
const IconSplit = (p) => (
  <Icon {...p}>
    <path d="M16 3h5v5" />
    <path d="M8 21H3v-5" />
    <path d="M21 3l-7.5 7.5" />
    <path d="M3 21l7.5-7.5" />
    <path d="M14 14l7 7" />
  </Icon>
);
const IconCompress = (p) => (
  <Icon {...p}>
    <path d="M4 14h6v6" />
    <path d="M20 10h-6V4" />
    <path d="M14 10l7-7" />
    <path d="M10 14l-7 7" />
  </Icon>
);
const IconTrash = (p) => (
  <Icon {...p}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </Icon>
);
const IconReorder = (p) => (
  <Icon {...p}>
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6l.01 0" />
    <path d="M3 12l.01 0" />
    <path d="M3 18l.01 0" />
  </Icon>
);
const IconRotate = (p) => (
  <Icon {...p}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0115-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 01-15 6.7L3 16" />
  </Icon>
);
const IconUpload = (p) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <path d="M17 8l-5-5-5 5" />
    <path d="M12 3v12" />
  </Icon>
);
const IconDownload = (p) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </Icon>
);
const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M20 6L9 17l-5-5" />
  </Icon>
);
const IconArrowLeft = (p) => (
  <Icon {...p}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </Icon>
);
const IconArrowRight = (p) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </Icon>
);
const IconSun = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </Icon>
);
const IconMoon = (p) => (
  <Icon {...p}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </Icon>
);
const IconSliders = (p) => (
  <Icon {...p}>
    <path d="M4 21v-7" />
    <path d="M4 10V3" />
    <path d="M12 21v-9" />
    <path d="M12 8V3" />
    <path d="M20 21v-5" />
    <path d="M20 12V3" />
    <path d="M1 14h6" />
    <path d="M9 8h6" />
    <path d="M17 16h6" />
  </Icon>
);
const IconX = (p) => (
  <Icon {...p}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </Icon>
);
const IconFile = (p) => (
  <Icon {...p}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
  </Icon>
);
const IconGrip = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="5" r="1" fill="currentColor" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="9" cy="19" r="1" fill="currentColor" />
    <circle cx="15" cy="5" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="19" r="1" fill="currentColor" />
  </Icon>
);
const IconPlus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);
const IconLock = (p) => (
  <Icon {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </Icon>
);
const IconZap = (p) => (
  <Icon {...p}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </Icon>
);
const IconShield = (p) => (
  <Icon {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Icon>
);
const IconSparkles = (p) => (
  <Icon {...p}>
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
  </Icon>
);
const IconChevronDown = (p) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

Object.assign(window, {
  Icon,
  IconMerge,
  IconSplit,
  IconCompress,
  IconTrash,
  IconReorder,
  IconRotate,
  IconUpload,
  IconDownload,
  IconCheck,
  IconArrowLeft,
  IconArrowRight,
  IconSun,
  IconMoon,
  IconSliders,
  IconX,
  IconFile,
  IconGrip,
  IconPlus,
  IconLock,
  IconZap,
  IconShield,
  IconSparkles,
  IconChevronDown,
});
