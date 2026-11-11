export const MAX_SCORE = 800;
export function points(correct: boolean, sealed: boolean, timeout = false) {
  return timeout || !correct ? 0 : sealed ? 200 : 100;
}
