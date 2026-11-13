/** Bounded original pixel effects. All work shares the scene's single frame loop. */
export function atmosphereFX(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  ground: number,
  t: number,
  gx: number,
  gy: number,
  phase: string,
  age: number,
) {
  // Three distant fog ribbons, eight lamp motes, three stepped puddle ripples.
  c.fillStyle = "#91b4a1";
  c.globalAlpha = 0.035;
  for (let i = 0; i < 3; i++) {
    const x = ((t * 3 + i * w * 0.37) % (w + 110)) - 110;
    c.fillRect(Math.round(x), ground - 31 - i * 7, 94, 3);
    c.fillRect(Math.round(x + 14), ground - 34 - i * 7, 63, 3);
  }
  c.fillStyle = "#c9bd83";
  for (let i = 0; i < 8; i++) {
    c.globalAlpha = 0.14 + (i % 3) * 0.04;
    const x = w * 0.6 + Math.sin(t * 0.7 + i * 2) * 14;
    const y = ground - 99 + ((i * 11 + t * 5) % 72);
    c.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  c.fillStyle = "#718d7b";
  for (let i = 0; i < 3; i++) {
    const progress = (t * 0.6 + i * 0.31) % 1;
    const size = Math.round(2 + progress * 11),
      x = w * [0.2, 0.57, 0.83][i],
      y = ground + [43, 56, 35][i];
    c.globalAlpha = (1 - progress) * 0.24;
    c.fillRect(Math.round(x - size), y, size * 2, 1);
    c.fillRect(Math.round(x - size + 2), y + 3, Math.max(1, size * 2 - 4), 1);
  }
  if (phase === "answering" || phase === "home") {
    c.fillStyle = "#91c4ac";
    for (let i = 0; i < 8; i++) {
      c.globalAlpha = 0.08 + (1 - i / 8) * 0.15;
      c.fillRect(
        Math.round(gx - 3 - i * 3),
        Math.round(gy + 9 + i * 2 + Math.sin(t * 2 - i) * 2),
        (i % 2) + 1,
        2,
      );
    }
  }
  if (phase === "banished" && age < 0.55) {
    const n = Math.round(age * 50);
    c.globalAlpha = (1 - age / 0.55) * 0.6;
    c.fillStyle = "#b2c9a5";
    c.fillRect(gx + 14 - n, gy + 20, n * 2, 1);
    c.fillRect(gx + 14 - n + 3, gy + 15, n * 2 - 6, 1);
    c.fillRect(gx + 14 - n + 3, gy + 25, n * 2 - 6, 1);
  }
  c.globalAlpha = 1;
}
