import { useId } from "react";
import type { SVGProps } from "react";
type Props = SVGProps<SVGSVGElement>;
const deco = { "aria-hidden": true as const, focusable: false };
export function PostalCrest(p: Props) {
  return (
    <svg viewBox="0 0 80 80" {...deco} {...p}>
      <path
        d="M58 9A32 32 0 1 0 69 57 28 28 0 0 1 58 9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M23 31h36v25H23z m0 0 18 14 18-14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m63 14 2 5 5 2-5 2-2 5-2-5-5-2 5-2z M49 7v8m-4-4h8"
        fill="currentColor"
      />
    </svg>
  );
}
export function PostOfficeWindow(p: Props) {
  const id = useId();
  return (
    <svg viewBox="0 0 420 360" {...deco} {...p}>
      <defs>
        <linearGradient id={id} x2="0" y2="1">
          <stop stopColor="#152e39" />
          <stop offset="1" stopColor="#376066" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d="M45 326V169a165 152 0 0 1 330 0v157Z" />
        </clipPath>
      </defs>
      <path
        d="M27 337V168a183 167 0 0 1 366 0v169"
        fill="#17292c"
        stroke="#547270"
        strokeWidth="2"
      />
      <g clipPath={`url(#${id}-clip)`}>
        <path d="M45 0h330v326H45z" fill={`url(#${id})`} />
        <circle cx="271" cy="92" r="35" fill="#e2e9c6" />
        <path
          d="M230 111c-7-19 8-29 22-19 4-22 29-24 37-7 22-3 28 10 24 20h18v13h-119Z"
          fill="#75918c"
        />
        <g fill="#142b32">
          <path d="M37 326V229l48-33 46 33v97Z" />
          <path d="M145 326V187h17v-28l18-15 18 15v28h18v139Z" />
          <path d="M242 326V241h15v-24l47-20 48 20v24h27v85Z" />
        </g>
        <g fill="#a58f56" opacity=".55">
          <path d="M75 248h9v15h-9zm20 0h9v15h-9zm75-35h10v16h-10zm17 0h10v16h-10zm83 38h9v15h-9zm38 0h9v15h-9z" />
        </g>
        <g className="rain" stroke="#a8dad0" opacity=".18">
          <path d="m74 67-8 23m93-51-8 23m55 40-8 23m120 31-8 23m34-126-8 23m-242 92-8 23m137 13-8 23m80-160-8 23m22 152-8 23" />
        </g>
      </g>
      <path d="M210 17v309M45 181h330" stroke="#152b30" strokeWidth="12" />
      <path d="M210 20v301M49 177h322" stroke="#54716c" strokeWidth="2" />
      <path d="M27 327h366v17H27z" fill="#98743d" />
      <path d="M22 326h376v5H22" fill="#d7b66f" />
    </svg>
  );
}
export function DeskLamp(p: Props) {
  const id = useId();
  return (
    <svg viewBox="0 0 330 350" {...deco} {...p}>
      <defs>
        <linearGradient id={id} x1=".5" y1="0" x2=".5" y2="1">
          <stop stopColor="#e8c77d" stopOpacity=".23" />
          <stop offset="1" stopColor="#e8c77d" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-brass`}>
          <stop stopColor="#79603c" />
          <stop offset=".5" stopColor="#d7b66f" />
          <stop offset="1" stopColor="#98743d" />
        </linearGradient>
      </defs>
      <path d="m143 122-92 203h279L228 121Z" fill={`url(#${id})`} />
      <path
        d="M84 314v-146c0-82 95-92 103-56"
        fill="none"
        stroke={`url(#${id}-brass)`}
        strokeWidth="13"
      />
      <path
        d="M65 311q-39 5-45 20h132q-4-16-45-20Z"
        fill={`url(#${id}-brass)`}
      />
      <path
        d="M187 60c-44 0-53 27-56 59 27 15 73 17 108 0-1-33-14-59-52-59Z"
        fill="#315e59"
      />
      <path
        d="M141 106q47 13 89 0"
        fill="none"
        stroke="#4b7775"
        strokeWidth="3"
      />
      <ellipse cx="185" cy="121" rx="54" ry="9" fill="#d7b66f" />
      <ellipse cx="186" cy="122" rx="40" ry="4" fill="#f7eedc" />
      <path d="M183 54h10v9h-10Z" fill="#d7b66f" />
    </svg>
  );
}
export function Moth(p: Props) {
  return (
    <svg viewBox="0 0 40 28" {...deco} {...p}>
      <path
        d="M19 15C4-10-6 13 15 20 1 23 10 31 20 20c10 11 19 3 5 0C46 13 36-10 21 15"
        fill="#efe1c5"
      />
      <path d="m20 11 1 11m-1-9-4-4m4 4 4-4" stroke="#b99d73" strokeWidth="2" />
    </svg>
  );
}
export function GhostPortrait({
  kind = "postmaster",
  ...p
}: Props & { kind?: string }) {
  return (
    <svg viewBox="0 0 100 110" {...deco} {...p}>
      <path
        d="M18 91V48c0-43 64-43 64 0v43L70 86 59 96 49 87 35 96Z"
        fill="#c4e2d4"
      />
      <path
        d="M28 45c0-27 21-29 31-27-24-2-37 13-37 37v31l8-4Z"
        fill="#ddf2e9"
      />
      <path
        d="M36 50q5-4 10-1m13 0q5-3 9 1"
        stroke="#28494b"
        strokeWidth="2"
        fill="none"
      />
      <g className="ghost-eyes" fill="#253d3c">
        <circle cx="41" cy="58" r="3" />
        <circle cx="63" cy="58" r="3" />
      </g>
      {["vesper", "ink", "spark"].includes(kind) && (
        <g
          fill="none"
          stroke={kind === "spark" ? "#98743d" : "#28534f"}
          strokeWidth={kind === "spark" ? 4 : 2}
        >
          <circle cx="40" cy="58" r="10" />
          <circle cx="64" cy="58" r="10" />
          <path d="M50 58h4" />
        </g>
      )}
      {kind === "moss" ? (
        <>
          <path d="M10 38h80L75 32 67 13H35l-8 19Z" fill="#6e8061" />
          <path d="M67 79q13-17 16-3-9 10-16 3" fill="#4b7775" />
        </>
      ) : kind === "encore" ? (
        <>
          <path d="m36 79 15 7 15-7v15l-15-8-15 8Z" fill="#81372e" />
          <path d="M64 80h25v28H64Z" fill="#f7eedc" />
          <path d="M69 87h14m-14 5h14m-14 5h14" stroke="#98743d" />
        </>
      ) : kind === "elsewhere" ? (
        <>
          <path d="M23 76q27 12 55 0v9q-26 12-55 0Z" fill="#b74435" />
          <path d="m56 91 15-8 20 6v20l-20-6-15 7Z" fill="#dac49b" />
          <path d="m70 86 1 17m-10-7 24 1" stroke="#98743d" />
        </>
      ) : kind === "ink" ? (
        <path d="m74 96 10-34 4 1-10 34-4 5Z" fill="#98743d" />
      ) : kind === "vesper" ? (
        <>
          <path d="m55 86 16-8 21 8v24l-21-7-16 7Z" fill="#23464b" />
          <path
            d="m69 86 2 8-6-4h11l-6 5m10-4h7m-7 9h6"
            stroke="#d7b66f"
            fill="none"
          />
        </>
      ) : (
        <>
          <path d="M23 35q-3-19 20-20h30l8 17-28 9Z" fill="#23464b" />
          <path d="m25 36 53-6q-12 15-45 12Z" fill="#101e26" />
          <path d="M54 25h11v7H54z m0 0 5 4 6-4" fill="none" stroke="#d7b66f" />
        </>
      )}
    </svg>
  );
}
export function Envelope(p: Props) {
  return (
    <svg viewBox="0 0 300 190" {...deco} {...p}>
      <path d="M10 34 147 0l143 34v146H10Z" fill="#b99d73" />
      <path className="paper-insert" d="M30 25h240v137H30z" fill="#f7eedc" />
      <path d="M10 34h280v146H10Z" fill="#efe1c5" />
      <path
        className="envelope-flap"
        d="m10 34 140 89L290 34Z"
        fill="#f7eedc"
        stroke="#dac49b"
      />
      <path
        d="m10 180 107-81 33 24 34-24 106 81"
        fill="#efe1c5"
        stroke="#dac49b"
      />
      <path d="M23 163h49m-49 6h31" stroke="#b99d73" strokeWidth="2" />
      <circle cx="150" cy="119" r="17" fill="#b74435" />
      <path
        d="m141 116 9 7 9-7m-18 0h18v13h-18Z"
        fill="none"
        stroke="#efe1c5"
      />
    </svg>
  );
}
export function RubberStamp(p: Props) {
  return (
    <svg viewBox="0 0 140 165" {...deco} {...p}>
      <path d="M48 20q22-21 44 0l-9 76H57Z" fill="#61483b" />
      <path d="M54 24q14-13 23-8l-7 75H58Z" fill="#7f6050" />
      <path d="M52 89h36v17H52Z" fill="#d7b66f" />
      <path d="M25 105q45-17 90 0v31H25Z" fill="#493b35" />
      <path d="M24 131h92v16H24Z" fill="#b74435" />
      <path d="M31 149h78v4H31Z" fill="#81372e" />
    </svg>
  );
}
export function WaxSeal(p: Props) {
  return (
    <svg viewBox="0 0 80 80" {...deco} {...p}>
      <path
        d="m40 3 8 4 9-1 5 8 9 4 1 10 5 8-4 9 1 10-8 6-4 9-10 1-9 5-8-4-10 1-6-8-9-4-1-10-5-9 4-8-1-10 8-6 4-9 10-1Z"
        fill="#b74435"
      />
      <circle cx="40" cy="40" r="24" fill="#a53e32" stroke="#cf6950" />
      <path
        d="M26 31h28v20H26z m0 0 14 12 14-12"
        fill="none"
        stroke="#efb28d"
        strokeWidth="2"
      />
      <path
        d="M18 24q6-11 19-12m19 48 7-8"
        stroke="#da7a60"
        fill="none"
        strokeWidth="2"
      />
    </svg>
  );
}
export function DeadLetterDrawer(p: Props) {
  return (
    <svg viewBox="0 0 190 150" {...deco} {...p}>
      <path d="M8 20h174v119H8Z" fill="#493d35" />
      <path d="M17 30h155v70H17Z" fill="#152222" />
      <path d="m55 43 88 11-6 55-89-12Z" fill="#efe1c5" />
      <path d="M18 93h154v38H18Z" fill="#685044" />
      <rect x="50" y="99" width="91" height="25" rx="3" fill="#98743d" />
      <path d="M58 105h75v12H58Z" fill="#2e3530" />
      <path d="M66 111h59" stroke="#d7b66f" />
    </svg>
  );
}
export function ReceiptArt(p: Props) {
  return (
    <svg viewBox="0 0 90 130" {...deco} {...p}>
      <path
        d="M8 3h74v120l-6-4-6 4-6-4-6 4-6-4-6 4-6-4-6 4-6-4-6 4-6-4-8 4Z"
        fill="#f7eedc"
      />
      <path
        d="M17 23h56m-56 8h56m-56 68h56"
        stroke="#98743d"
        strokeDasharray="3 3"
      />
      <PostalCrest x="20" y="35" width="50" height="50" color="#285b4f" />
    </svg>
  );
}
export function CollectibleStamp({ index, ...p }: Props & { index: number }) {
  return (
    <svg viewBox="0 0 100 112" {...deco} {...p}>
      <path
        d="M8 5h84v102H8Z"
        fill="#dac49b"
        stroke="#98743d"
        strokeWidth="3"
        strokeDasharray="5 4"
      />
      <path
        d="M17 14h66v82H17Z"
        fill={
          ["#285b4f", "#23464b", "#81372e", "#4b7775", "#705d3d", "#37646b"][
            index
          ]
        }
      />
      <g stroke="#f7eedc" fill="none" strokeWidth="2">
        {index === 0 ? (
          <path d="M28 37h44v32H28z m0 0 22 18 22-18" />
        ) : index === 1 ? (
          <>
            <path d="M64 29a23 23 0 1 0 8 34 21 21 0 0 1-8-34Z" />
            <circle cx="42" cy="60" r="9" />
            <circle cx="63" cy="60" r="9" />
            <path d="M51 60h3" />
          </>
        ) : index === 2 ? (
          <WaxSeal x="20" y="25" width="60" height="60" />
        ) : index === 3 ? (
          <path d="m50 30 4 10 11 1-9 7 3 11-9-6-9 6 3-11-9-7 11-1Zm-20 33 3 7 7 1-6 4 2 7-6-4-6 4 2-7-6-4 7-1Zm40 0 3 7 7 1-6 4 2 7-6-4-6 4 2-7-6-4 7-1Z" />
        ) : index === 4 ? (
          <>
            <path d="M38 80V50q0-20 24-20v12m-35 40h27m3-41-12 19h32L65 41Z" />
          </>
        ) : (
          <>
            <circle cx="50" cy="55" r="25" />
            <ellipse cx="50" cy="55" rx="12" ry="25" />
            <path d="M25 55h50M30 41h40M30 69h40" />
          </>
        )}
      </g>
      <path d="M30 101h40" stroke="#98743d" />
    </svg>
  );
}
export function UtilityIcon({
  kind,
  ...p
}: Props & {
  kind:
    "collection" | "sound" | "muted" | "settings" | "close" | "arrow" | "pause";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...deco}
      {...p}
    >
      {kind === "collection" ? (
        <>
          <path d="M5 3h14v18H5Z" strokeDasharray="2 2" />
          <path d="M8 7h8v10H8z m0 0 4 4 4-4" />
        </>
      ) : kind === "sound" || kind === "muted" ? (
        <>
          <path d="M4 9h4l5-4v14l-5-4H4Z" />
          {kind === "sound" ? (
            <path d="M17 8q5 4 0 8m3-11q7 7 0 14" />
          ) : (
            <path d="m17 9 5 6m0-6-5 6" />
          )}
        </>
      ) : kind === "settings" ? (
        <>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="8" cy="6" r="2" fill="var(--night-900)" />
          <circle cx="16" cy="12" r="2" fill="var(--night-900)" />
          <circle cx="10" cy="18" r="2" fill="var(--night-900)" />
        </>
      ) : kind === "close" ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : kind === "pause" ? (
        <path d="M8 5v14M16 5v14" />
      ) : (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}
