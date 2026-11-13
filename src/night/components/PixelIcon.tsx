export function PixelIcon({
  name,
}: {
  name:
    | "ghost"
    | "sound"
    | "mute"
    | "pause"
    | "settings"
    | "help"
    | "close"
    | "arrow"
    | "note"
    | "home";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      {name === "ghost" ? (
        <>
          <path
            fill="currentColor"
            d="M8 2h8v2h4v4h2v14h-4v-3h-3v3H9v-3H6v3H2V8h2V4h4z"
          />
          <path fill="var(--ink)" d="M7 8h3v4H7zm7 0h3v4h-3z" />
        </>
      ) : name === "sound" || name === "mute" ? (
        <>
          <path fill="currentColor" d="M2 9h5V7h3V4h3v16h-3v-3H7v-2H2z" />
          {name === "sound" ? (
            <path fill="currentColor" d="M16 8h2v8h-2zm4-3h2v14h-2z" />
          ) : (
            <path
              fill="currentColor"
              d="M16 8h2v2h2V8h2v2h-2v4h2v2h-2v-2h-2v2h-2v-2h2v-4h-2z"
            />
          )}
        </>
      ) : name === "pause" ? (
        <path fill="currentColor" d="M5 4h5v16H5zm9 0h5v16h-5z" />
      ) : name === "settings" ? (
        <path
          fill="currentColor"
          d="M2 5h5V2h3v3h12v3H10v3H7V8H2zm0 11h12v-3h3v3h5v3h-5v3h-3v-3H2z"
        />
      ) : name === "help" ? (
        <path
          fill="currentColor"
          d="M7 3h10v2h3v7h-3v3h-4v2h-3v-5h4V9h3V6H7v3H4V5h3zm3 16h4v4h-4z"
        />
      ) : name === "close" ? (
        <path
          fill="currentColor"
          d="M4 4h4v4h4v4h4v4h4v4h-4v-4h-4v-4H8V8H4zm12 0h4v4h-4v4h-4V8h4zM8 12h4v4H8v4H4v-4h4z"
        />
      ) : name === "arrow" ? (
        <path
          fill="currentColor"
          d="M3 10h12V7h-3V4h4v3h3v3h3v4h-3v3h-3v3h-4v-3h3v-3H3z"
        />
      ) : name === "home" ? (
        <path
          fill="currentColor"
          d="M10 3h4v3h3v3h3v3h2v3h-4v7h-5v-6h-3v6H5v-7H1v-3h3V9h3V6h3z"
        />
      ) : (
        <>
          <path fill="currentColor" d="M5 2h14v20H5z" />
          <path fill="var(--ink)" d="M8 6h8v2H8zm0 5h8v2H8zm0 5h5v2H8z" />
        </>
      )}
    </svg>
  );
}
