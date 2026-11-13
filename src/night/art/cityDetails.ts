/** Original street dressing. Static geometry is baked into the existing background cache. */
function block(
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
function sign(
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size = 8,
) {
  c.fillStyle = color;
  c.font = `${size}px "VT323",monospace`;
  c.textAlign = "left";
  c.fillText(text, Math.round(x), Math.round(y));
}
function wire(
  c: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  sag: number,
) {
  for (let x = x1; x < x2; x += 2) {
    const t = (x - x1) / (x2 - x1);
    block(c, x, y1 + (y2 - y1) * t + 4 * sag * t * (1 - t), 2, 1, "#111d21");
  }
}
export function streetDetails(
  c: CanvasRenderingContext2D,
  w: number,
  ground: number,
) {
  c.save();
  // Service wires sag between rooftops; a few old insulators catch the streetlight.
  wire(c, -12, ground - 163, w * 0.56, ground - 143, 18);
  wire(c, w * 0.52, ground - 148, w + 8, ground - 171, 14);
  wire(c, -12, ground - 155, w * 0.56, ground - 135, 20);
  for (const x of [w * 0.12, w * 0.56, w * 0.87]) {
    block(c, x, ground - 180, 2, 180, "#303c35");
    block(c, x - 4, ground - 160, 10, 2, "#6c6651");
    block(c, x - 2, ground - 164, 2, 3, "#8b8065");
  }
  // Uneven fire escape, boarded windows and stained plaster on the left tenement.
  for (let floor = 0; floor < 3; floor++) {
    const y = ground - 140 + floor * 34;
    block(c, 21, y, 25, 2, "#181f20");
    block(c, 21, y + 1, 1, 10, "#6b6554");
    block(c, 44, y + 1, 1, 10, "#6b6554");
    for (let x = 25; x < 44; x += 5) block(c, x, y + 1, 1, 8, "#303d36");
    block(c, 20, y + 10, 27, 2, "#66624e");
    for (let step = 0; step < 8; step++) {
      block(c, 24 + step * 2, y + 12 + step * 3, 8, 1, "#1d2826");
      block(c, 31 + step * 2, y + 12 + step * 3, 1, 3, "#585b4b");
    }
  }
  block(c, 3, ground - 43, 12, 4, "#6c5842");
  block(c, 4, ground - 33, 14, 3, "#62503b");
  block(c, 5, ground - 73, 10, 16, "#675d47");
  block(c, 6, ground - 72, 7, 10, "#b1a385");
  block(c, 8, ground - 68, 5, 1, "#645b46");
  block(c, 6, ground - 60, 5, 2, "#8c7b5a");
  // A narrow laundry stays lit. One machine is broken; the rest are empty.
  const lx = Math.round(Math.min(130, w * 0.22));
  block(c, lx, ground - 56, 55, 56, "#202e2c");
  block(c, lx - 2, ground - 60, 59, 4, "#66503a");
  block(c, lx + 2, ground - 53, 51, 11, "#344c42");
  sign(c, "COIN WASH", lx + 7, ground - 45, "#d4bb80", 9);
  block(c, lx + 3, ground - 40, 49, 35, "#666a4e");
  block(c, lx + 5, ground - 38, 45, 28, "#364b43");
  for (let i = 0; i < 3; i++) {
    const x = lx + 7 + i * 14;
    block(c, x, ground - 27, 11, 15, "#9b9271");
    block(c, x + 2, ground - 24, 7, 8, "#1a3032");
    block(c, x + 3, ground - 23, 5, 5, i === 2 ? "#4e5042" : "#668a79");
    block(c, x + 2, ground - 26, 2, 1, "#d2bb7e");
  }
  block(c, lx + 37, ground - 35, 10, 5, "#a7946c");
  sign(c, "OUT", lx + 38, ground - 31, "#332f29", 5);
  for (let i = 0; i < 6; i++)
    block(c, lx + i * 9, ground - 42, 5, 3, i % 2 ? "#78674b" : "#324c43");
  // A damp alley, old utility box, torn notices and a leaning bicycle.
  const ax = Math.round(w * 0.43);
  block(c, ax, ground - 48, 26, 48, "#142324");
  block(c, ax + 2, ground - 47, 2, 44, "#3c4539");
  block(c, ax + 22, ground - 46, 2, 44, "#232d29");
  block(c, ax + 7, ground - 31, 11, 19, "#34413a");
  block(c, ax + 8, ground - 30, 9, 2, "#66715b");
  block(c, ax + 14, ground - 24, 2, 2, "#ab8c59");
  block(c, ax + 8, ground - 18, 7, 1, "#1c2c29");
  block(c, ax + 3, ground - 8, 9, 7, "#594b36");
  block(c, ax + 4, ground - 7, 7, 1, "#8a7350");
  const bx = ax + 23;
  for (const x of [bx, bx + 16]) {
    block(c, x, ground - 8, 8, 2, "#0e1d21");
    block(c, x - 1, ground - 6, 2, 5, "#0e1d21");
    block(c, x + 7, ground - 6, 2, 5, "#0e1d21");
    block(c, x, ground - 1, 8, 2, "#0e1d21");
  }
  for (let i = 0; i < 9; i++) {
    block(c, bx + 4 + i, ground - 3 - i, 2, 1, "#68827a");
    block(c, bx + 12 + i, ground - 11 + i, 2, 1, "#68827a");
  }
  block(c, bx + 18, ground - 15, 2, 13, "#71857a");
  block(c, bx + 16, ground - 16, 6, 2, "#182b2c");
  block(c, bx + 6, ground - 13, 6, 2, "#172728");
  // A small lodging-house sign: an uneven panel and one dead letter, not clean new neon.
  const hx = Math.round(w * 0.83);
  block(c, hx, ground - 139, 17, 64, "#1b2527");
  block(c, hx - 1, ground - 140, 19, 2, "#68634e");
  block(c, hx + 16, ground - 137, 2, 60, "#4f594c");
  for (const [i, letter] of [..."ROOMS"].entries())
    sign(
      c,
      letter,
      hx + 5,
      ground - 129 + i * 10,
      i === 2 ? "#5c624e" : "#c7a778",
      9,
    );
  block(c, hx + 2, ground - 85, 13, 6, "#384b40");
  sign(c, "WEEK", hx + 3, ground - 81, "#a3ab80", 5);
  // Shelter bench, forgotten shopping bag and a curled-up street cat.
  const shelter = Math.round(w * 0.62);
  block(c, shelter + 15, ground - 15, 40, 3, "#6e5a41");
  block(c, shelter + 18, ground - 11, 2, 11, "#172626");
  block(c, shelter + 50, ground - 11, 2, 11, "#172626");
  block(c, shelter + 57, ground - 9, 6, 9, "#9d8968");
  block(c, shelter + 58, ground - 11, 4, 2, "#73674d");
  block(c, shelter + 59, ground - 12, 2, 1, "#8f8061");
  block(c, shelter + 28, ground - 7, 9, 5, "#18282a");
  block(c, shelter + 35, ground - 9, 4, 5, "#263a37");
  block(c, shelter + 35, ground - 10, 1, 2, "#263a37");
  block(c, shelter + 38, ground - 10, 1, 2, "#263a37");
  block(c, shelter + 37, ground - 7, 1, 1, "#b1b18b");
  // A dented parked car sits below the pedestrian plane, leaving Pete and the threat unobscured.
  const cx = Math.round(w * 0.73),
    cy = ground + 30;
  block(c, cx + 7, cy - 14, 42, 4, "#22312f");
  block(c, cx + 3, cy - 10, 52, 4, "#33413b");
  block(c, cx - 6, cy - 6, 70, 14, "#3e4940");
  block(c, cx + 11, cy - 11, 15, 9, "#182b31");
  block(c, cx + 29, cy - 11, 15, 9, "#192c31");
  block(c, cx + 12, cy - 10, 12, 1, "#648078");
  block(c, cx + 31, cy - 10, 10, 1, "#648078");
  block(c, cx + 27, cy - 11, 2, 12, "#61604c");
  block(c, cx - 7, cy + 2, 72, 3, "#6b6c55");
  block(c, cx - 8, cy - 2, 4, 3, "#b3ab70");
  block(c, cx + 61, cy - 2, 3, 3, "#7d5140");
  block(c, cx + 1, cy + 5, 11, 7, "#111f22");
  block(c, cx + 47, cy + 5, 11, 7, "#111f22");
  block(c, cx + 4, cy + 7, 5, 3, "#5a6255");
  block(c, cx + 50, cy + 7, 5, 3, "#5a6255");
  block(c, cx + 18, cy + 1, 12, 1, "#6c5740");
  block(c, cx + 23, cy + 3, 8, 1, "#5f4937");
  block(c, cx + 45, cy - 2, 7, 1, "#a08f67");
  // A patchwork of puddles, cigarette ends and paper has direction rather than screen-wide noise.
  for (let i = 0; i < 5; i++) {
    const x = w * (0.08 + i * 0.19);
    block(c, x, ground + 29 + (i % 2) * 20, 10, 1, "#56706a");
    block(c, x + 2, ground + 31 + (i % 2) * 20, 6, 1, "#294c4c");
  }
  block(c, w * 0.19, ground + 35, 5, 2, "#a39674");
  block(c, w * 0.19 + 4, ground + 35, 2, 1, "#79604c");
  block(c, w * 0.55, ground + 28, 7, 4, "#827e65");
  block(c, w * 0.55 + 2, ground + 30, 4, 1, "#4a584d");
  // Subtle wall streaks and a coat left on the roof washing line.
  wire(c, w * 0.31, ground - 136, w * 0.48, ground - 131, 4);
  block(c, w * 0.36, ground - 134, 10, 12, "#3e4b46");
  block(c, w * 0.36 - 2, ground - 133, 3, 6, "#3e4b46");
  block(c, w * 0.36 + 9, ground - 133, 3, 6, "#3e4b46");
  block(c, w * 0.36 + 4, ground - 132, 1, 9, "#273b36");
  c.restore();
}
/** Sparse city life, sampled in the existing loop. Motion freezes with the chase. */
export function cityLife(
  c: CanvasRenderingContext2D,
  w: number,
  ground: number,
  t: number,
) {
  c.save();
  // Steam escapes the road grate in three slow stepped plumes.
  for (let i = 0; i < 3; i++) {
    const age = (t * 0.13 + i * 0.33) % 1,
      x = Math.round(w * 0.82 - 4 + Math.sin(age * 5 + i) * 4),
      y = Math.round(ground + 7 - age * 27);
    c.globalAlpha = (1 - age) * 0.14;
    block(c, x, y, 12 + age * 12, 3, "#9cae9d");
    block(c, x + 3, y - 3, 7 + age * 8, 3, "#9cae9d");
  }
  c.globalAlpha = 1;
  // A room slowly brightens behind a curtain; a resident pauses in the window.
  const roomX = 37,
    roomY = ground - 126,
    cycle = t % 36;
  if (cycle > 10 && cycle < 26) {
    c.globalAlpha = Math.min(1, (cycle - 10) / 3, (26 - cycle) / 3) * 0.45;
    block(c, roomX, roomY, 8, 13, "#a99b68");
    block(c, roomX + 4, roomY + 4, 3, 4, "#26332e");
    block(c, roomX + 3, roomY + 8, 5, 5, "#26332e");
    c.globalAlpha = 1;
  }
  // Water runs down a drainpipe. Four drops, no new animation loop or timers.
  for (let i = 0; i < 4; i++) {
    const y = ground - 100 + ((t * 23 + i * 27) % 100);
    block(c, w * 0.56 + 3, y, 1, 3, "#627d76");
  }
  c.restore();
}
