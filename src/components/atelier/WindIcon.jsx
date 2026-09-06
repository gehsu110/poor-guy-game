const paths = {
  home: (
    <>
      <path d="m3 11 9-8 9 8M6 10v11h12V10M10 21v-7h4v7" />
    </>
  ),
  map: (
    <>
      <path d="m3 5 6-2 6 3 6-2v16l-6 2-6-3-6 2Zm6-2v16m6-13v16" />
      <path d="m6 12 3-2 5 3 4-3" strokeDasharray="1 3" />
    </>
  ),
  book: (
    <>
      <path d="M4 3h13l3 3v15H4ZM8 7h7M8 11h5m-3 8 8-8 2 2-8 8-3 1Z" />
    </>
  ),
  journal: (
    <>
      <path d="M12 5C9 3 5 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v16M6 8h2m-2 4h2m8-4h2m-2 4h2" />
    </>
  ),
  bag: (
    <>
      <path d="M5 7h14l2 14H3ZM8 8V6a4 4 0 0 1 8 0v2M8 13c0 5 8 5 8 0" />
    </>
  ),
  top: (
    <>
      <path d="m8 3-4 2-3 6 5 3 1-3-1 11h12l-1-11 1 3 5-3-3-6-4-2-4 3Zm0 0 4 3 4-3M12 6v16" />
    </>
  ),
  hair: (
    <>
      <path d="M5 20C1 10 4 3 12 3s11 7 7 17M5 13c4-1 6-4 7-7 1 4 4 6 7 7M7 13v3a5 5 0 0 0 10 0v-3M5 16l-1 5m15-5 1 5" />
    </>
  ),
  hat: (
    <>
      <path d="M4 13 6 5h4l2 2 5-2 3 9M2 14c5 5 16 5 20 0M5 11c4 3 11 3 14 0" />
    </>
  ),
  prop: (
    <>
      <path d="m5 3 14 2-2 17-14-2ZM8 7l7 1m-7 4 5 1m-6 4 7 1" />
    </>
  ),
  companion: (
    <>
      <path d="m6 9-2-6 6 3a9 9 0 0 1 4 0l6-3-2 6a7 7 0 1 1-12 0Z" />
      <path d="M8 12v1m8-1v1m-6 3 2 1 2-1" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  back: <path d="m11 4-8 8 8 8M3 12h18" />,
  arrow: <path d="M3 12h18m-7-7 7 7-7 7" />,
  expand: <path d="M3 9V3h6m6 0h6v6m0 6v6h-6m-6 0H3v-6M3 3l6 6m6 6 6 6" />,
  sparkle: <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Zm7 0v4m-2-2h4" />,
  check: <path d="m4 12 5 5L21 5" />,
  heart: <path d="M12 21 3 12C-3 4 8 0 12 7c4-7 15-3 9 5Z" />,
  undo: (
    <>
      <path d="M3 4v6h6M3 10C8 1 21 6 21 14a7 7 0 0 1-12 5" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
};
export default function WindIcon({ name = "sparkle", className = "" }) {
  return (
    <svg
      className={`wind-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.sparkle}
    </svg>
  );
}
