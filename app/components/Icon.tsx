import type { SVGProps } from "react";

const PATHS = {
  user: (
    <>
      <circle cx="6.5" cy="5.5" r="2.5" />
      <path d="M1.5 13.5c0-2.76 2.24-4 5-4s5 1.24 5 4" strokeLinecap="round" />
    </>
  ),
  info: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3M8 11h.01" strokeLinecap="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4v4l3 2" strokeLinecap="round" />
    </>
  ),
  search: (
    <>
      <circle cx="6.5" cy="6.5" r="4" />
      <path d="M10.5 10.5L14 14" strokeLinecap="round" />
    </>
  ),
  close: <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />,
  check: <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />,
  site: (
    <>
      <path d="M8 2L2 6v8h12V6z" strokeLinejoin="round" />
      <path d="M6 14V9h4v5" strokeLinecap="round" />
    </>
  ),
  client: (
    <>
      <rect x="2" y="6" width="7" height="8" rx="1" />
      <path d="M9 9h3a1 1 0 011 1v4H9" strokeLinecap="round" />
    </>
  ),
  budget: (
    <>
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
      <path d="M5.5 10V7M8 10V5.5M10.5 10V8" strokeLinecap="round" />
    </>
  ),
  asset: (
    <>
      <circle cx="4" cy="4" r="1.5" />
      <circle cx="12" cy="4" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <path d="M5.5 4h5M4 5.5v5M12 5.5v5M5.5 12h5" strokeLinecap="round" />
    </>
  ),
  plus: <path d="M8 3v10M3 8h10" strokeLinecap="round" />,
  apps: (
    <>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </>
  ),
  chevron: <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />,
  "arrow-right": <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />,
  logout: <path d="M9 3H4a1 1 0 00-1 1v8a1 1 0 001 1h5M11 5l3 3-3 3M14 8H6" strokeLinecap="round" strokeLinejoin="round" />,
  menu: <path d="M3 4h10M3 8h10M3 12h10" strokeLinecap="round" />,
  settings: (
    <>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M14 8h-2M4 8H2M12.7 3.3l-1.4 1.4M4.7 11.3l-1.4 1.4M12.7 12.7l-1.4-1.4M4.7 4.7L3.3 3.3" strokeLinecap="round" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  strokeWidth = 1.5,
  ...rest
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
