import calendar from "./calendar.json" with { type: "json" };
import type { Mystery, Clue, AnswerField } from "../game/types";
import { mulberry32, shuffle } from "../../game/rng";
export const schedule = calendar;
export const SCHEDULE_START = calendar[0].date;
export const SCHEDULE_END = calendar.at(-1)!.date;
export const hhmm = (n: number) => {
  const t = ((n % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};
const field = (
  label: string,
  hint: string,
  answer: string,
  kind: AnswerField["kind"] = "text",
): AnswerField => ({ label, hint, answer, kind });
export const permutations = <T>(xs: T[]): T[][] =>
  xs.length
    ? xs.flatMap((x, i) =>
        permutations(xs.filter((_, j) => i !== j)).map((t) => [x, ...t]),
      )
    : [[]];
const names = [
  "Ada",
  "Bram",
  "Cora",
  "Dee",
  "Eda",
  "Finn",
  "Gus",
  "Hale",
  "Iris",
  "Joss",
  "Kit",
  "Lea",
  "Mara",
  "Nell",
  "Oren",
  "Pax",
  "Quinn",
  "Rafe",
  "Sela",
  "Tess",
  "Una",
  "Vale",
  "Wren",
  "Yara",
];
const places = [
  "TUNNEL",
  "LOCKER",
  "BRIDGE",
  "CELLAR",
  "SWITCH",
  "DRAWER",
  "ARCADE",
  "CHAPEL",
  "CLOSET",
  "HARBOR",
];
const shift = (s: string, a: number, b: number) =>
  [...s]
    .map((c, i) =>
      String.fromCharCode(
        65 + ((c.charCodeAt(0) - 65 + (i % 2 ? b : a) + 52) % 26),
      ),
    )
    .join("");
export const decode = (s: string, a: number, b: number) =>
  [...shift(s, -a, -b)].reverse().join("");
export function switchSolutions(labels: string[], onCount = 2) {
  return Array.from({ length: 32 }, (_, mask) =>
    labels.map((_, i) => !!(mask & (1 << i))),
  )
    .filter(
      ([a, b, c, d, e]) =>
        a !== b &&
        b === c &&
        c !== d &&
        e === (a && d) &&
        [a, b, c, d, e].filter(Boolean).length === onCount,
    )
    .map((bits) =>
      labels
        .filter((_, i) => bits[i])
        .sort()
        .join("+"),
    );
}
export function roomSolutions(people: string[]) {
  return permutations(people).filter(
    (r) =>
      r.indexOf(people[1]) === r.indexOf(people[0]) + 1 &&
      r.indexOf(people[2]) > r.indexOf(people[1]) &&
      [0, 3].includes(r.indexOf(people[3])) &&
      ![0, 3].includes(r.indexOf(people[0])),
  );
}
export const leverChecksum = (sequence: number[]) =>
  sequence.reduce((s, k) => s ^ [0, 6, 3, 4][k], 0);
export function createCase(p: (typeof calendar)[number]): Mystery {
  const random = mulberry32(p.seed),
    int = (a: number, b: number) => a + Math.floor(random() * (b - a + 1));
  const people = shuffle(names, random).slice(0, 4),
    [a, b, c, d] = people;
  const clues: Clue[] = [];
  const add = (
    title: string,
    evidence: string,
    question: string,
    fields: AnswerField[],
    explanation: string,
    mechanism: string,
    solutions: string[][],
  ) => {
    const i = clues.length;
    clues.push({
      id: `${p.id}-${i + 1}`,
      title,
      evidence,
      question,
      fields,
      explanation,
      mechanism,
      solutions,
      difficulty: i < 2 ? "easy" : i < 5 ? "medium" : i < 7 ? "hard" : "final",
      seconds: [65, 75, 95, 110, 110, 120, 120, 150][i],
    });
  };
  const target = int(100, 899),
    seals = shuffle(["ASH", "BELL", "COIN", "REED"], random),
    stamp = seals[0];
  const cards = shuffle(
    [
      { n: target, stamp, from: 10, to: 30 },
      { n: target + 1, stamp: seals[1], from: 10, to: 30 },
      { n: target + 2, stamp, from: 25, to: 40 },
      { n: target + 3, stamp, from: 5, to: 20 },
    ],
    random,
  );
  const gateSolutions = cards.filter(
    (g) => g.stamp === stamp && g.from <= 20 && 20 < g.to,
  );
  add(
    "The gate register",
    `Pete finds a torn dispatch note: “At 00:20, use the gate with the ${stamp} seal.” A permit is valid FROM its start time, UNTIL but not including its end time.\n${cards.map((g) => `Gate ${g.n} · ${g.stamp} · 00:${String(g.from).padStart(2, "0")}–00:${String(g.to).padStart(2, "0")}`).join("\n")}`,
    "Which gate was valid, and what was its seal?",
    [
      field("Gate number", "Three digits", String(target), "number"),
      field("Seal", "Word printed on the note", stamp),
    ],
    `Only gate ${target} has the ${stamp} seal and a permit covering 00:20. A permit ending at or before 00:20 has expired; one starting later is not valid yet.`,
    "permit-window",
    gateSolutions.map((g) => [String(g.n), g.stamp]),
  );
  const minute = int(0, 239),
    offset = int(7, 29) * (p.variant % 2 ? -1 : 1),
    lag = int(5, 18),
    printed = hhmm(minute + offset + lag),
    time = hhmm(minute);
  add(
    "The recorder’s delay",
    `The recorder displays ${printed} when its report is saved. Its clock runs ${Math.abs(offset)} minutes ${offset > 0 ? "fast" : "slow"}. A report is saved exactly ${lag} real minutes AFTER the event. All times use a 24-hour clock; crossing midnight is allowed.\nThe report records the witness passing the locked door.`,
    "At what real time did the witness pass the door?",
    [field("Real event time", "HH:MM · 24-hour time", time, "time")],
    `Correct the clock first: ${printed} ${offset > 0 ? "−" : "+"} ${Math.abs(offset)} minutes. Then subtract the ${lag}-minute delay. The event was at ${time}.`,
    "clock-offset-and-delay",
    [[hhmm(minute + offset + lag - offset - lag)]],
  );
  const rows = roomSolutions(people),
    arrangement = rows[0],
    room = int(2, 4),
    occupant = arrangement[room - 1],
    keyPerson = people[int(0, 2)],
    keyRoom = arrangement.indexOf(keyPerson) + 1;
  add(
    "Four rooms, one key",
    `Rooms 1–4 run west to east. Each contains exactly one of ${people.join(", ")}.\n${b} is immediately east of ${a}.\n${c} is east of ${b}, but need not be adjacent.\n${d} is in an end room.\n${a} is not in an end room.\nA key is attached to ${keyPerson}’s room number.`,
    `Name the occupant of room ${room}, and give ${keyPerson}’s room number.`,
    [
      field(`Room ${room} occupant`, "Witness’s first name", occupant),
      field(`${keyPerson}’s room`, "Number 1–4", String(keyRoom), "number"),
    ],
    `West to east: ${arrangement.map((n, i) => `${i + 1} ${n}`).join(" → ")}. There is only one arrangement satisfying all five constraints.`,
    "room-permutation",
    rows.map((r) => [r[room - 1], String(r.indexOf(keyPerson) + 1)]),
  );
  const even = keyRoom + 3,
    word = places[int(0, places.length - 1)],
    cipher = shift([...word].reverse().join(""), keyRoom, even);
  add(
    "The strip behind the key",
    `The strip reads ${cipher}. Count its positions from 1.\nThe writer first REVERSED a six-letter place name, then shifted odd positions FORWARD by ${keyPerson}’s room number from page 3, and even positions FORWARD by 3 more than that.\nRecover the original place. Wrap A–Z; do not reverse until the shifts are undone.`,
    "What place is hidden in the strip?",
    [field("Decoded place", "Six letters", word)],
    `Page 3 gives ${keyRoom}. Subtract ${keyRoom} from odd-position letters and ${even} from even-position letters: ${[...word].reverse().join("")}. Reverse that to read ${word}.`,
    "cross-page-alternating-cipher",
    [[decode(cipher, keyRoom, even)]],
  );
  const ab = int(3, 6),
    ac = int(7, 10),
    bc = int(2, 4),
    cx = int(4, 7);
  const routes = [
    { path: "A-B-C-X", minutes: ab + bc + cx },
    { path: "A-C-X", minutes: ac + cx },
    { path: "B-C-X", minutes: bc + cx },
    { path: "C-X", minutes: cx },
  ];
  // Construct off-time witnesses against the shortest route, so none can accidentally match by another legal route.
  const logs = shuffle(
    [
      {
        name: a,
        node: "A",
        depart: minute - Math.min(routes[0].minutes, routes[1].minutes) + 1,
      },
      { name: b, node: "B", depart: minute - routes[2].minutes },
      { name: c, node: "C", depart: minute - cx - 1 },
      {
        name: d,
        node: "A",
        depart: minute - Math.max(routes[0].minutes, routes[1].minutes) - 2,
      },
    ],
    random,
  );
  const viable = logs.flatMap((l) =>
    routes
      .filter(
        (r) =>
          r.path.startsWith(l.node) &&
          (l.depart + r.minutes + 1440) % 1440 === minute,
      )
      .map((r) => [l.name, r.path]),
  );
  add(
    "The passage log",
    `The door event happened at the REAL time from page 2.\nONE-WAY passages: A→B ${ab} min; A→C ${ac} min; B→C ${bc} min; C→X ${cx} min. X is the door. No other passages exist. Nobody waited or revisited a room.\n${logs.map((l) => `${l.name} left ${l.node} at ${hhmm(l.depart)} real time.`).join("\n")}`,
    "Who could arrive at X at the exact event time, and by which route?",
    [
      field("Witness", "First name", b),
      field("Route", "Letters separated by hyphens, e.g. A-X", "B-C-X", "code"),
    ],
    `At ${time}, only ${b} could arrive exactly on time: ${hhmm(minute - routes[2].minutes)} + ${routes[2].minutes} minutes via B→C→X. Other legal journeys arrive earlier or later.`,
    "directed-route-alibi",
    viable,
  );
  const labels = shuffle(["A", "B", "C", "D", "E"], random),
    [s, t, u, v, w] = labels,
    onCount = p.variant < 2 ? 2 : 3,
    powered = switchSolutions(labels, onCount),
    pair = powered[0];
  add(
    "The interlock",
    `The exit’s ${word} circuit has five switches A–E. Exactly ${onCount === 2 ? "TWO" : "THREE"} must be ON.\n${s} and ${t} must differ.\n${t} and ${u} must match.\n${u} and ${v} must differ.\n${w} is ON if and only if BOTH ${s} and ${v} are ON.\nEvery condition must hold at once.`,
    "Which switches must be ON?",
    [
      field(
        "Powered switches",
        "Letters in any order, separated by +",
        pair,
        "set",
      ),
    ],
    `The relationships allow two possible states. Only ${pair} has exactly ${onCount} switches ON. The other state violates the required count.`,
    "boolean-interlock",
    powered.map((x) => [x]),
  );
  let relay: string;
  if (p.variant === 0) {
    const seq = Array.from({ length: int(7, 11) }, () => int(1, 3));
    relay = String(leverChecksum(seq));
    add(
      "The memory relay",
      `Indicators A, B, C start OFF. Button 1 toggles A and B; button 2 toggles B and C; button 3 toggles A. “Toggle” means ON becomes OFF and OFF becomes ON.\nPress: ${seq.join(" → ")}. Every press counts.\nAt the end, add 4 for A ON, 2 for B ON and 1 for C ON.`,
      "Which indicators end ON, and what is their total?",
      [
        field(
          "Indicators ON",
          "Letters joined with +, or NONE",
          relay === "0"
            ? "NONE"
            : ["A", "B", "C"]
                .filter((_, i) => Number(relay) & [4, 2, 1][i])
                .join("+"),
          "set",
        ),
        field("Total", "A=4, B=2, C=1", relay, "number"),
      ],
      `Cancel identical button presses in pairs, then toggle what remains. The final total is ${relay}. Only final ON indicators count.`,
      "stateful-toggle",
      [
        [
          relay === "0"
            ? "NONE"
            : ["A", "B", "C"]
                .filter((_, i) => Number(relay) & [4, 2, 1][i])
                .join("+"),
          String(seq.reduce((mask, key) => mask ^ [0, 6, 3, 4][key], 0)),
        ],
      ],
    );
  } else if (p.variant === 1) {
    const first = int(1, 4),
      second = first + int(1, 2),
      third = int(7, 9),
      sum = first + second + third,
      difference = third - first;
    relay = `${first}${second}${third}`;
    const candidates = Array.from({ length: 900 }, (_, i) =>
      String(i + 100),
    ).filter((pin) => {
      const [x, y, z] = [...pin].map(Number);
      return (
        new Set(pin).size === 3 &&
        x + y + z === sum &&
        y - x === second - first &&
        Number([...pin].reverse().join("")) - Number(pin) === difference * 99
      );
    });
    add(
      "The reversed lock",
      `The lock takes three DIFFERENT digits. The first is not zero.\nThe digits sum to ${sum}.\nThe middle digit is ${second - first} greater than the first.\nReversing the three digits makes a number ${difference * 99} greater than the original.\nEnter the ORIGINAL number.`,
      "What is the three-digit lock code?",
      [field("Original code", "Three digits", relay, "code")],
      `Reversal changes the value by 99 × (last − first), so last − first = ${difference}. Together with middle = first + ${second - first} and the sum ${sum}, this gives ${relay}.`,
      "reverse-digit-system",
      candidates.map((x) => [x]),
    );
  } else if (p.variant === 2) {
    const x = int(3, 13),
      y = int(4, 15),
      z = int(5, 17),
      tare = int(2, 5);
    relay = String(x);
    add(
      "The freight scale",
      `Every weighing uses ONE copy of the SAME empty tray. Its weight is unknown. The same crates A, B, C are reused.\nA + B on the tray: ${x + y + tare} kg.\nB + C on the tray: ${y + z + tare} kg.\nA + C on the tray: ${x + z + tare} kg.\nA + B + C on the tray: ${x + y + z + tare} kg.\nAll figures are exact. Work out the tray first, then the individual crates.`,
      "How much do the tray, crate A and crate C each weigh?",
      [
        field("Empty tray", "Kilograms, number only", String(tare), "number"),
        field("Crate A", "Kilograms, number only", String(x), "number"),
        field("Crate C", "Kilograms, number only", String(z), "number"),
      ],
      `The three pair readings total twice the crate weights plus THREE trays. Twice the all-crate reading contains twice the crate weights plus TWO trays. Their difference is the tray: ${tare} kg. Remove it from each reading, then combine A+B and A+C minus B+C to get 2A=${2 * x}. A=${x} kg and C=${z} kg.`,
      "paired-weight-equations",
      [
        [
          String(
            x +
              y +
              tare +
              (y + z + tare) +
              (x + z + tare) -
              2 * (x + y + z + tare),
          ),
          String((x + y + (x + z) - (y + z)) / 2),
          String((y + z + (x + z) - (x + y)) / 2),
        ],
      ],
    );
  } else {
    const start = int(10, 40),
      steps = Array.from({ length: 5 }, () => int(2, 9)),
      direction = [1, -1, 1, 1, -1];
    const net = steps.reduce((s, n, i) => s + n * direction[i], start);
    relay = String(net);
    add(
      "The overwritten counter",
      `A service counter begins at ${start}. Apply these instructions IN ORDER.\n${steps.map((n, i) => `${i + 1}. ${direction[i] > 0 ? "Add" : "Subtract"} ${n}.`).join("\n")}\nThen replace the result with DOUBLE that result minus the starting value. The recorded checksum is the number BEFORE the replacement; the display is the number AFTER.`,
      "Give both the recorded checksum and the final display.",
      [
        field("Recorded checksum", "Before replacement", relay, "number"),
        field(
          "Final display",
          "After replacement",
          String(2 * net - start),
          "number",
        ),
      ],
      `The five instructions yield ${net}. That is the recorded checksum. The replacement yields 2×${net}−${start} = ${2 * net - start}. Reading only the final display gives the wrong checksum.`,
      "ordered-counter",
      [[String(net), String(2 * net - start)]],
    );
  }
  add(
    "The last door",
    `The door asks for six facts, in this order: gate number; real door-event time; decoded place; witness who reached X exactly on time; powered switches; recorded relay value (the total, original code, crate A weight, or checksum from page 7).\nUse Earlier pages to inspect your solved evidence. The chase pauses while the notebook is open.`,
    "Reconstruct the complete exit record.",
    [
      field("Gate number", "From page 1", String(target), "number"),
      field("Real event time", "From page 2 · HH:MM", time, "time"),
      field("Decoded place", "From page 4", word),
      field("Witness", "From page 5", b),
      field("Powered switches", "From page 6", pair, "set"),
      field("Relay value", "From page 7", relay, "number"),
    ],
    `Gate ${target}; ${time}; ${word}; ${b}; ${pair}; ${relay}. Every entry agrees with the evidence. Pete opens the ${word.toLowerCase()} door and leaves the altered record behind.`,
    "cross-page-synthesis",
    [[String(target), time, word, b, pair, relay]],
  );
  return {
    ...p,
    ending: `Pete reaches the ${word.toLowerCase()}. ${b}’s route explains the altered record. Behind him, the last streetlight goes out.`,
    clues,
  };
}
export const mysteries = calendar.map(createCase);
export const practiceMysteries = calendar.slice(0, 3).map((p, i) =>
  createCase({
    ...p,
    id: `practice-${i + 1}`,
    date: "2026-11-12",
    seed: p.seed + 98765,
    number: 0,
    title: [
      "The lamplighter’s errand",
      "The shuttered booth",
      "Footsteps by the canal",
    ][i],
  }),
);
const tutorialClues: Clue[] = [
  {
    id: "lesson-1",
    title: "A note under the streetlight",
    evidence:
      "Pete is on his way home when a page skids across the pavement.\n“Meet me at gate 24. The seal is MOTH.”\nRead the page, then type both facts into the boxes. This first page has no timer.",
    question: "Copy the gate number and the seal.",
    fields: [
      field("Gate number", "Number on the note", "24", "number"),
      field("Seal", "Word on the note", "MOTH"),
    ],
    explanation:
      "You read both facts. During a real case, you will have to deduce them. Capital letters and extra spaces do not matter.",
    difficulty: "easy",
    seconds: 3600,
    mechanism: "tutorial-reading",
    solutions: [["24", "MOTH"]],
  },
  {
    id: "lesson-2",
    title: "Something follows",
    evidence:
      "The ghost moves when you are solving a page. A correct deduction banishes it. A wrong submission costs 35% of the page’s time; three different wrong submissions end the run.\nA clock reads 01:15. It is 5 minutes FAST. There is no recording delay.\nFor this lesson: 01:15 minus 5 minutes gives 01:10.",
    question: "What is the real time?",
    fields: [field("Real time", "HH:MM", "01:10", "time")],
    explanation:
      "The ghost is banished. In Daily play, pages build on each other. Open Earlier pages to review solved evidence and pause the chase. Escape also pauses. Your Daily attempt has not been used.",
    difficulty: "medium",
    seconds: 120,
    mechanism: "tutorial-chase",
    solutions: [["01:10"]],
  },
];
export const tutorial: Mystery = {
  id: "tutorial",
  date: SCHEDULE_START,
  number: 0,
  title: "Pete’s first night",
  location: "THE FIRST STREETLIGHT",
  intro: "One street. Two pages. Learn to get Pete home.",
  ending: "You know the way now. A new mystery is waiting on the street.",
  clues: tutorialClues,
};
export const mysteryById: Record<string, Mystery> = Object.fromEntries(
  [...mysteries, ...practiceMysteries, tutorial].map((m) => [m.id, m]),
);
export const dailyMystery = (date: string) =>
  mysteries.find((m) => m.date === date);
