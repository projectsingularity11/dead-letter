/** Original hand-authored pixel matrices. No filtered/vector character approximations. */
export const pete = [
  "      HHHHH      ",
  "     HHHHHHH     ",
  "     HHHSHSS     ",
  "     HSSSSSS     ",
  "     SSSSKSS     ",
  "      SSSSS      ",
  "      CCCC       ",
  "    CCCCCCCC     ",
  "   CCCLCCCLCC    ",
  "   CCCLCCCLCCC   ",
  "   SCCLCCCLCCS   ",
  "   SCCLCCCLCCS   ",
  "   SCCLCCCLCCS   ",
  "    CCLCCCLCC    ",
  "    CCCCCCCC     ",
  "     GGGGGG      ",
  "     GGGGGG      ",
  "     GGGGGG      ",
  "     GG  GG      ",
  "     GG  GG      ",
  "     GG  GG      ",
  "     KK  KK      ",
  "    KKK  KKK     ",
];
export const ghost = [
  "      ttttt      ",
  "    ttgggggtt    ",
  "   tgggggggggt   ",
  "  tgggwwwwggggt  ",
  "  tggwwwwwwgggt  ",
  " tggwwKwwKwwggt  ",
  " tggwwKwwKwwggt  ",
  " tggwwwwwwwwgggt ",
  " tggwwwwwwwwgggt ",
  " tggwwwwwwwwgggt ",
  " tggwwwwwwwwgggt ",
  " tggwwwwwwwwgggt ",
  " tggwwwwwwwwgggt ",
  "  tggwwwwwwgggt  ",
  "  tggwwwwwwggt   ",
  "  tgggwwwwgggt   ",
  " tggtggwwggtggt  ",
  " ttt tggggt ttt  ",
  "      tttt       ",
];
export const palette: Record<string, string> = {
  H: "#493b34",
  S: "#c4ae8e",
  K: "#17201f",
  C: "#a89b7b",
  L: "#716a51",
  G: "#344e4c",
  t: "#426c69",
  g: "#73a69b",
  w: "#b6d3bc",
};
const spriteCache = new WeakMap<string[], Map<number, HTMLCanvasElement>>();
export function sprite(
  ctx: CanvasRenderingContext2D,
  grid: string[],
  x: number,
  y: number,
  scale = 2,
  alpha = 1,
) {
  let sizes = spriteCache.get(grid);
  if (!sizes) {
    sizes = new Map();
    spriteCache.set(grid, sizes);
  }
  let image = sizes.get(scale);
  if (!image) {
    image = document.createElement("canvas");
    image.width = Math.max(...grid.map((row) => row.length)) * scale;
    image.height = grid.length * scale;
    const pen = image.getContext("2d")!;
    for (let j = 0; j < grid.length; j++)
      for (let i = 0; i < grid[j].length; i++) {
        const color = palette[grid[j][i]];
        if (color) {
          pen.fillStyle = color;
          pen.fillRect(i * scale, j * scale, scale, scale);
        }
      }
    sizes.set(scale, image);
  }
  const before = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, Math.round(x), Math.round(y));
  ctx.globalAlpha = before;
}

/** Offset where the rightmost ghost pixel first touches a Pete pixel on a shared row. */
export function contactOffset(ghostY = 3, scale = 2) {
  let offset = Infinity;
  for (
    let y = Math.max(0, ghostY);
    y < Math.min(pete.length * scale, ghostY + ghost.length * scale);
    y++
  ) {
    const pr = pete[Math.floor(y / scale)],
      gr = ghost[Math.floor((y - ghostY) / scale)];
    const pLeft = [...pr].findIndex((ch) => !!palette[ch]);
    let gRight = -1;
    for (let i = 0; i < gr.length; i++) if (palette[gr[i]]) gRight = i + 1;
    if (pLeft >= 0 && gRight >= 0)
      offset = Math.min(offset, pLeft * scale - gRight * scale);
  }
  return offset;
}
export function ghostPosition(
  peteX: number,
  gap: number,
  ghostY = 3,
  reduced = false,
) {
  const visibleGap =
    gap <= 0 ? 0 : reduced ? Math.ceil(gap / 8) * 8 : Math.ceil(gap);
  return Math.round(peteX) + contactOffset(ghostY) - visibleGap;
}
