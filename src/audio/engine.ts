let context: AudioContext | null = null;
let master: GainNode | null = null;
let ambience: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
export async function activate() {
  try {
    context ??= new AudioContext();
    if (!master) {
      master = context.createGain();
      master.gain.value = 0.3;
      master.connect(context.destination);
    }
    await context.resume();
    return true;
  } catch {
    return false;
  }
}
export function sound(
  kind: "select" | "paper" | "stamp" | "correct" | "incorrect" | "results",
) {
  if (!context || context.state !== "running") return;
  const c = context;
  const now = c.currentTime;
  const notes =
    kind === "correct"
      ? [523, 659]
      : kind === "results"
        ? [392, 494, 587]
        : [
            kind === "stamp"
              ? 92
              : kind === "incorrect"
                ? 160
                : kind === "paper"
                  ? 260
                  : 620,
          ];
  notes.forEach((f, i) => {
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = kind === "incorrect" ? "triangle" : "square";
    o.frequency.setValueAtTime(f, now + i * 0.13);
    g.gain.setValueAtTime(0, now + i * 0.13);
    g.gain.linearRampToValueAtTime(0.02, now + i * 0.13 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.13 + 0.16);
    o.connect(g).connect(master!);
    o.start(now + i * 0.13);
    o.stop(now + i * 0.13 + 0.2);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  });
  if (kind === "paper" || kind === "stamp") {
    const buffer = c.createBuffer(1, c.sampleRate * 0.12, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const n = c.createBufferSource(),
      filter = c.createBiquadFilter(),
      gain = c.createGain();
    filter.type = "lowpass";
    filter.frequency.value = kind === "paper" ? 850 : 240;
    gain.gain.value = 0.025;
    n.buffer = buffer;
    n.connect(filter).connect(gain).connect(master!);
    n.start();
    n.onended = () => {
      n.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }
}
export function atmosphere(on: boolean) {
  if (!on) {
    ambience?.stop();
    ambience?.disconnect();
    ambientGain?.disconnect();
    ambience = null;
    ambientGain = null;
    return;
  }
  if (!context || ambience) return;
  ambience = context.createOscillator();
  ambientGain = context.createGain();
  ambience.type = "sine";
  ambience.frequency.value = 110;
  ambientGain.gain.value = 0.006;
  ambience.connect(ambientGain).connect(master!);
  ambience.start();
}
