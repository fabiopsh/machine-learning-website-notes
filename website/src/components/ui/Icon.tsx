import type { SVGProps } from 'react'

/** Set di icone disegnato a mano: tratto 1.6, griglia 24, estremità arrotondate. */
const paths = {
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  moon: <path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowUpRight: <path d="M7 17L17 7M8 7h9v9" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  reset: (
    <>
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4.5h4.5" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  pause: <path d="M8 5.5v13M16 5.5v13" />,
  step: <path d="M6 5.5v13l9-6.5zM18 5.5v13" />,
  book: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
    </>
  ),
  list: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  hash: <path d="M9 4L7 20M17 4l-2 16M4.5 9h15M3.5 15h15" />,
  figure: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 15l5-4.5 4 3.5 3-2.5 5 4" />
    </>
  ),
  sparkle: <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" />,
  hand: (
    <>
      <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M11 10.5v-2a1.5 1.5 0 0 1 3 0V11" />
      <path d="M14 10.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.5a5.5 5.5 0 0 1-4.3-2.1L4.4 15.3a1.5 1.5 0 0 1 2.3-1.9L8 15" />
    </>
  ),
  // tipi di riquadro
  definition: (
    <>
      <path d="M5 4.5h11.5a2 2 0 0 1 2 2V20l-3-2-3 2V6.5" />
      <path d="M5 4.5v13a2.5 2.5 0 0 0 2.5 2.5h5" />
    </>
  ),
  theorem: <path d="M5 19L12 5l7 14M8 13.5h8" />,
  example: (
    <>
      <path d="M9.5 3.5h5M10.5 3.5v5L5 18.5A1.5 1.5 0 0 0 6.3 20.5h11.4a1.5 1.5 0 0 0 1.3-2L13.5 8.5v-5" />
      <path d="M7.5 14.5h9" />
    </>
  ),
  note: (
    <>
      <path d="M6 4h9l3.5 3.5V20H6z" />
      <path d="M9 11h6M9 15h6" />
    </>
  ),
  tip: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4L2.8 19.5h18.4z" />
      <path d="M12 10v4.5M12 17h.01" />
    </>
  ),
  abstract: <path d="M5 6h14M5 10h14M5 14h9M5 18h6" />,
  question: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
    </>
  ),
  cube: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </>
  ),
  plane: <path d="M3.5 17l5-10h12l-5 10z" />,
  // lente di vetro con riflesso: interruttore Liquid Glass
  glass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7.6 10.2a4.8 4.8 0 0 1 3.4-3.1" />
      <path d="M14.8 16.4a4.8 4.8 0 0 0 2-2.2" opacity="0.55" />
    </>
  ),
  paper: (
    <>
      <path d="M6 3.5h8.5L18 7v13.5H6z" />
      <path d="M14 3.5V7.5h4" />
    </>
  ),
  star: <path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8z" />,
  // marchio di GitHub (pieno, non a tratto)
  github: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2.5a9.5 9.5 0 0 0-3 18.52c.47.09.65-.2.65-.46v-1.6c-2.64.57-3.2-1.27-3.2-1.27-.43-1.1-1.05-1.39-1.05-1.39-.86-.59.07-.58.07-.58.95.07 1.45.98 1.45.98.85 1.45 2.22 1.03 2.76.79.09-.61.33-1.03.6-1.27-2.1-.24-4.31-1.05-4.31-4.68 0-1.03.37-1.88.98-2.54-.1-.24-.43-1.2.09-2.51 0 0 .8-.26 2.61.97a9.1 9.1 0 0 1 4.76 0c1.81-1.23 2.61-.97 2.61-.97.52 1.31.19 2.27.09 2.51.61.66.98 1.51.98 2.54 0 3.64-2.22 4.44-4.33 4.67.34.3.64.88.64 1.77v2.63c0 .26.17.56.66.46A9.5 9.5 0 0 0 12 2.5z"
    />
  ),
} as const

export type IconName = keyof typeof paths

export function Icon({ name, size = 18, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
