import { atmosphereFX } from "./effects";
import { useEffect, useRef } from "react";
import type { Run } from "../game/types";
import { duration } from "../game/rules";
import { mulberry32 } from "../../game/rng";
import { pete, ghost, sprite, ghostPosition } from "./sprites";
type SceneProps = { run: Run | null; reduced: boolean; home?: boolean };
const colors = {
  sky: "#101e31",
  far: "#17334a",
  middle: "#204344",
  dark: "#192626",
  brick: "#423529",
  brickLight: "#65503b",
  ink: "#182321",
  road: "#292d29",
  pavement: "#45433a",
  puddle: "#276b73",
  line: "#797360",
  gold: "#efbe66",
  glass: "#f3cc79",
  teal: "#6bd5bf",
};
function rect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function pixelMoon(c: CanvasRenderingContext2D, x: number, y: number) {
  const spans = [
    [-8, -16, 16, 3],
    [-12, -13, 24, 4],
    [-15, -9, 30, 18],
    [-12, 9, 24, 4],
    [-8, 13, 16, 3],
  ];
  for (const [dx, dy, w, h] of spans) rect(c, x + dx, y + dy, w, h, "#d3e6bd");
  rect(c, x - 7, y - 7, 7, 6, "#8b9b88");
  rect(c, x + 5, y + 4, 5, 4, "#8b9b88");
  rect(c, x - 3, y + 10, 4, 2, "#8b9b88");
}
function facade(
  c: CanvasRenderingContext2D,
  x: number,
  w: number,
  top: number,
  ground: number,
  seed: number,
  near = false,
) {
  const r = mulberry32(seed);
  rect(c, x, top, w, ground - top, near ? colors.brick : colors.middle);
  rect(c, x - 3, top, w + 6, 5, near ? "#55483a" : "#2e4342");
  rect(c, x - 1, top + 7, w + 2, 2, near ? "#242c28" : "#1c3034");
  // Sparse exposed brick and mortar, rather than a texture over the whole image.
  for (let y = top + 15; y < ground - 5; y += 9) {
    const offset = (Math.floor(y / 9) % 2) * 7;
    for (let xx = x + 4 + offset; xx < x + w - 7; xx += 17) {
      if (r() > 0.57) {
        rect(c, xx, y, 13, 1, near ? "#574a3b" : "#2b4140");
        rect(c, xx + 12, y - 4, 1, 4, near ? "#4b4337" : "#2b4140");
      }
    }
  }
  for (let yy = top + 19; yy < ground - 50; yy += 32) {
    for (let xx = x + 10; xx < x + w - 13; xx += 25) {
      rect(c, xx, yy, 13, 21, "#162527");
      rect(c, xx + 2, yy + 2, 9, 16, r() > 0.69 ? "#a08b55" : "#2e4544");
      if (r() > 0.72) rect(c, xx + 3, yy + 3, 7, 4, "#d9b767");
      rect(c, xx, yy + 19, 14, 2, near ? "#6e6250" : "#40514a");
      rect(c, xx + 6, yy, 1, 19, "#21312e");
    }
  }
  rect(c, x + 9, ground - 44, 26, 44, "#1b2826");
  rect(c, x + 12, ground - 40, 20, 33, "#38413a");
  rect(c, x + 14, ground - 38, 16, 18, "#21312d");
  rect(c, x + 28, ground - 20, 2, 3, "#8c8160");
  rect(c, x + 5, ground - 2, 34, 2, "#67604b");
  if (w > 65) {
    rect(c, x + 43, ground - 42, w - 51, 37, "#1b2927");
    for (let yy = ground - 38; yy < ground - 9; yy += 4)
      rect(c, x + 45, yy, w - 55, 1, "#485046");
    rect(c, x + 41, ground - 49, w - 47, 6, "#62513d");
  }
  // Rain pipe, rooftop flue and aerial.
  rect(c, x + w - 5, top + 4, 2, ground - top - 4, "#263630");
  rect(c, x + 13, top - 13, 9, 13, near ? "#4b4135" : "#2b3e3c");
  rect(c, x + w - 22, top - 18, 1, 18, "#54625a");
  rect(c, x + w - 31, top - 14, 19, 1, "#54625a");
}
function lamp(
  c: CanvasRenderingContext2D,
  x: number,
  ground: number,
  light = true,
) {
  const top = ground - 115;
  rect(c, x, top, 3, 115, "#182421");
  rect(c, x - 5, ground - 4, 13, 4, "#1b2722");
  rect(c, x - 8, top - 5, 20, 3, "#6f6c4e");
  rect(c, x - 6, top - 14, 16, 9, "#333c30");
  rect(c, x - 4, top - 12, 12, 6, light ? "#f7cc70" : "#696d51");
  rect(c, x - 8, top - 17, 20, 3, "#62664c");
  rect(c, x - 5, top - 20, 14, 3, "#454e3b");
  if (light) {
    c.globalAlpha = 0.09;
    for (let i = 0; i < 10; i++)
      rect(c, x - 7 - i * 3, top - 3 + i * 11, 18 + i * 6, 11, "#d5bd75");
    c.globalAlpha = 1;
    rect(c, x - 18, ground + 7, 40, 2, "#777353");
    rect(c, x - 25, ground + 12, 54, 1, "#605f46");
  }
}
function background(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed = 17343,
) {
  const r = mulberry32(seed);
  const ground = Math.round(h * 0.76);
  rect(c, 0, 0, w, h, colors.sky);
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(r() * w),
      y = Math.floor(r() * h * 0.42);
    if (r() > 0.42) rect(c, x, y, 1, 1, r() > 0.8 ? "#7a9486" : "#3e595b");
  }
  pixelMoon(c, w * 0.79, h * 0.16);
  // Low, stepped cloud shapes.
  rect(c, w * 0.64, h * 0.19, w * 0.2, 4, "#2e4244");
  rect(c, w * 0.68, h * 0.19 - 3, w * 0.09, 3, "#2e4244");
  rect(c, w * 0.73, h * 0.19 + 4, w * 0.12, 3, "#263b40");
  rect(c, w * 0.14, h * 0.27, w * 0.24, 3, "#273c40");
  rect(c, w * 0.19, h * 0.27 - 3, w * 0.11, 3, "#273c40");
  // Distant skyline, water towers, rooftop silhouettes.
  for (let x = -8; x < w; x += 26 + Math.floor(r() * 24)) {
    const bw = 20 + r() * 32,
      bh = 32 + r() * 54;
    rect(c, x, ground - bh - 55, bw, bh + 55, colors.far);
    if (r() > 0.62) {
      rect(c, x + 5, ground - bh - 65, 14, 10, "#1d3237");
      rect(c, x + 6, ground - bh - 67, 12, 2, "#2c4142");
    }
    for (let yy = ground - bh - 45; yy < ground - 55; yy += 13)
      for (let xx = x + 4; xx < x + bw - 4; xx += 8)
        if (r() > 0.8) rect(c, xx, yy, 2, 4, "#53675a");
  }
  // Middle blocks leave a long view down the deserted road.
  for (let x = -20; x < w; x += 110) {
    const top = ground - 82 - r() * 44;
    facade(c, x, 93, top, ground, Math.floor(x + 900));
  }
  rect(c, 0, ground - 27, w, 27, "#263634");
  rect(c, 0, ground - 3, w, 3, "#5b5c4b");
  // Framing foreground buildings and storefronts.
  facade(
    c,
    -25,
    Math.min(155, w * 0.26),
    Math.max(18, ground - 178),
    ground,
    491,
    true,
  );
  facade(c, w - 126, 158, ground - 160, ground, 892, true);
  const shopx = Math.min(130, w * 0.22);
  rect(c, shopx, ground - 75, 57, 75, "#34392f");
  rect(c, shopx - 3, ground - 77, 63, 5, "#60533c");
  rect(c, shopx + 4, ground - 66, 49, 11, "#203734");
  c.fillStyle = "#a7b18d";
  c.font = '10px "VT323",monospace';
  c.textAlign = "center";
  c.fillText("NIGHT OWL", shopx + 29, ground - 57);
  rect(c, shopx + 5, ground - 51, 47, 41, "#1c2c2a");
  for (let xx = shopx + 7; xx < shopx + 50; xx += 7)
    rect(c, xx, ground - 50, 1, 37, "#405044");
  for (let yy = ground - 49; yy < ground - 12; yy += 5)
    rect(c, shopx + 6, yy, 44, 1, "#475044");
  // Station canopy and pixel signage.
  const sx = w * 0.62;
  rect(c, sx, ground - 57, 86, 5, "#60533f");
  rect(c, sx + 4, ground - 52, 3, 52, "#27362d");
  rect(c, sx + 76, ground - 52, 3, 52, "#27362d");
  rect(c, sx + 9, ground - 50, 63, 12, "#243c39");
  c.fillStyle = "#91a48d";
  c.font = '9px "VT323",monospace';
  c.fillText("NO SERVICE", sx + 41, ground - 41);
  rect(c, sx + 10, ground - 34, 59, 32, "#192a29");
  rect(c, sx + 34, ground - 34, 2, 32, "#3a4d41");
  // Street and paved foreground have a strong horizontal plane.
  rect(c, 0, ground, w, h - ground, "#292e2a");
  rect(c, 0, ground, w, 4, "#77705a");
  rect(c, 0, ground + 4, w, 2, "#333b32");
  rect(c, 0, ground + 6, w, 15, "#48483b");
  rect(c, 0, ground + 21, w, 2, "#77705a");
  rect(c, 0, ground + 23, w, 3, "#1a2826");
  for (let x = -30; x < w; x += 45) rect(c, x, ground + 7, 1, 13, "#2e3730");
  for (let i = 0; i < 130; i++) {
    const x = r() * w,
      y = ground + 27 + r() * (h - ground - 27);
    rect(c, x, y, 2 + r() * 6, 1, r() > 0.5 ? "#363b31" : "#232c27");
  }
  // Puddles: tiered pixel contours and short broken reflections.
  const pools: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ] = [
    [w * 0.13, ground + 42, w * 0.13],
    [w * 0.5, ground + 55, w * 0.24],
    [w * 0.79, ground + 34, w * 0.13],
    [w * 0.33, ground + 29, w * 0.08],
  ];
  for (const [px, py, pw] of pools) {
    rect(c, px, py, pw, 2, "#2f4745");
    rect(c, px - 5, py + 2, pw + 10, 5, colors.puddle);
    rect(c, px + 6, py + 7, pw - 10, 2, "#2d4542");
    for (let i = 0; i < 4; i++)
      rect(
        c,
        px + 3 + r() * Math.max(2, pw - 9),
        py + 2 + i,
        4 + r() * 10,
        1,
        "#5a7470",
      );
  }
  // Road furniture and small authored accents.
  rect(c, w * 0.39, ground - 22, 16, 22, "#3c4537");
  rect(c, w * 0.39 - 1, ground - 25, 18, 3, "#62614a");
  for (let x = w * 0.39 + 3; x < w * 0.39 + 15; x += 4)
    rect(c, x, ground - 20, 1, 17, "#25332c");
  rect(c, w * 0.82, ground + 7, 18, 9, "#26332d");
  for (let x = w * 0.82 + 2; x < w * 0.82 + 18; x += 3)
    rect(c, x, ground + 8, 1, 7, "#666650");
  lamp(c, w * 0.15, ground);
  lamp(c, w * 0.6, ground);
  lamp(c, w * 0.91, ground, false);
  return ground;
}
export function StreetScene({ run, reduced, home = false }: SceneProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef({ run, reduced, home });
  latest.current = { run, reduced, home };
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const c = el.getContext("2d");
    if (!c) return;
    let raf = 0,
      last = 0,
      phaseStart = performance.now(),
      lastPhase = "";
    let block = -1,
      revision = 0,
      painted = "",
      visible = true,
      destroyed = false;
    let pointerX = 0,
      pointerY = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || latest.current.reduced) return;
      const box = el.getBoundingClientRect();
      pointerX = (e.clientX - box.left) / box.width - 0.5;
      pointerY = (e.clientY - box.top) / box.height - 0.5;
    };
    const leave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    const surface = el.parentElement!;
    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener("pointerleave", leave);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    });
    intersection.observe(el);
    let backing = document.createElement("canvas"),
      ground = 0,
      w = 0,
      h = 0;
    const resize = (force = false) => {
      if (destroyed) return;
      const box = el.getBoundingClientRect();
      const nextW = Math.max(180, Math.round(box.width / 2)),
        nextH = Math.max(140, Math.round(box.height / 2));
      if (!force && nextW === w && nextH === h) return;
      w = nextW;
      h = nextH;
      revision++;
      el.width = w;
      el.height = h;
      backing.width = w + 64;
      backing.height = h;
      c.imageSmoothingEnabled = false;
      ground = background(
        backing.getContext("2d")!,
        w + 64,
        h,
        17343 + (latest.current.run?.clue ?? 0) * 113,
      );
      block = latest.current.run?.clue ?? 0;
      draw(performance.now(), true);
    };
    const draw = (now: number, force = false) => {
      if (!force) raf = requestAnimationFrame(draw);
      if (!force && (now - last < 33 || document.hidden || !visible)) return;
      last = now;
      const { run: r, reduced: reduce, home: isHome } = latest.current;
      const phase = r?.phase ?? "home";
      if (phase !== lastPhase) {
        phaseStart = now;
        lastPhase = phase;
      }
      const age = (now - phaseStart) / 1000;
      const frozen = reduce || r?.paused;
      const key = `${revision}:${phase}:${r?.clue}:${r?.remaining}:${r?.paused}:${reduce}`;
      if (!force && frozen && key === painted) return;
      painted = key;
      const t = frozen ? 0 : now / 1000;
      c.clearRect(0, 0, w, h);
      if ((r?.clue ?? 0) !== block) {
        block = r?.clue ?? 0;
        ground = background(
          backing.getContext("2d")!,
          w + 64,
          h,
          17343 + block * 113,
        );
      }
      const scroll =
        phase === "walking" && !reduce
          ? Math.min(32, Math.floor((age / 1.15) * 32))
          : isHome
            ? 0
            : 32;
      c.drawImage(
        backing,
        -scroll + (frozen ? 0 : Math.round(pointerX * 5)),
        frozen ? 0 : Math.round(pointerY * 2),
      );
      const px = Math.round(w * (w < 300 ? 0.59 : 0.51));
      const py = ground - 46;
      const walking = phase === "walking";
      const walkProgress = reduce ? 1 : Math.min(1, age / 1.15);
      const peteX = walking ? px - 30 * (1 - walkProgress) : px;
      // Pete's small, finite walk cycle and paper pickup.
      const step = walking && !frozen ? Math.floor(t * 7) % 2 : 0;
      const caught = phase === "caught";
      if (caught) {
        sprite(c, pete, peteX, py + 5, 2, Math.max(0.35, 1 - age * 0.7));
        rect(c, peteX - 2, ground + 3, 30, 3, "#1b2824");
      } else {
        sprite(c, pete, peteX, py - (walking && step ? 1 : 0), 2);
        if (walking && step) {
          rect(c, peteX + 8, ground - 8, 7, 3, "#283b35");
          rect(c, peteX + 16, ground - 4, 7, 3, "#17201f");
        }
      }
      // The found scrap is visible before it is picked up; then held in Pete's hand.
      const paperOnGround =
        isHome || phase === "intro" || (walking && walkProgress < 0.82);
      const paperX = paperOnGround ? px + 40 : peteX + 24;
      const paperY = paperOnGround ? ground + 7 : py + 17;
      rect(c, paperX, paperY, 9, 6, "#c7bf9a");
      rect(c, paperX + 2, paperY + 2, 5, 1, "#777860");
      rect(c, paperX + 2, paperY + 4, 3, 1, "#777860");
      const ratio = r ? Math.max(0, r.remaining / duration(r)) : 1;
      const gap = (w < 300 ? w * 0.43 : w * 0.36) * ratio;
      const ghostDy = 3 + (reduce ? 0 : Math.round(Math.sin(t * 2) * 2));
      const gx = ghostPosition(px, gap, ghostDy, reduce);
      const gy = py + ghostDy;
      if (phase === "banished" || phase === "escaped") {
        if (!reduce && age < 0.8) {
          for (let i = 0; i < 12; i++) {
            const dx = ((i % 4) - 1.5) * (3 + age * 18),
              dy = Math.floor(i / 4) * 8 - age * 22;
            c.globalAlpha = Math.max(0, 1 - age / 0.8);
            rect(c, gx + dx + 12, gy + dy, 3, 3, i % 2 ? "#91c4ac" : "#486f65");
            c.globalAlpha = 1;
          }
        }
      } else if (
        !walking &&
        phase !== "intro" &&
        !(r?.mode === "tutorial" && r.clue === 0)
      ) {
        sprite(c, ghost, gx, gy, 2, phase === "home" ? 0.6 : 1);
        if (!reduce) {
          rect(c, gx + 6, ground + 11, 20, 1, "#42625a");
          rect(c, gx + 11, ground + 14, 13, 1, "#36534c");
        }
      }
      if (!frozen) atmosphereFX(c, w, h, ground, t, gx, gy, phase, age);
      // Subtle rain, local to the scene. Paused/reduced-motion worlds stay still.
      if (!frozen) {
        c.globalAlpha = 0.22;
        for (let i = 0; i < 44; i++) {
          const x = ((i * 73 + Math.floor(t * 9)) % (w + 10)) - 5;
          const y = (i * 31 + Math.floor(t * 47)) % h;
          rect(c, x, y, 1, 3, "#719088");
        }
        c.globalAlpha = 1;
      }
      if (!frozen && Math.floor(t * 10) % 137 === 0) {
        c.globalAlpha = 0.08;
        rect(c, w * 0.6 - 4, ground - 129, 13, 8, "#172421");
        c.globalAlpha = 1;
      }
    };
    resize();
    const observer = new ResizeObserver(() => resize());
    observer.observe(el);
    document.fonts.ready.then(() => resize(true));
    raf = requestAnimationFrame(draw);
    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <canvas ref={canvas} className="street-canvas" aria-hidden="true" />;
}
