import type { Clue, Mystery } from "../game/types";

type CasePlan = {
  id: string;
  prefix: string;
  title: string;
  location: string;
  intro: string;
  ending: string;
  people: [string, string, string, string];
  sites: [string, string, string, string];
  event: string;
  minute: number;
  fast: number;
  lag: number;
  word: string;
  sequence: number[];
};
const plans: CasePlan[] = [
  {
    id: "last-train",
    prefix: "train",
    title: "The 2:17 train",
    location: "BRIAR STATION",
    intro:
      "The train arrived empty. Four people swear they saw its conductor leave.",
    ending:
      "The conductor was a decoy. Pete follows the witness’s route into the service tunnel.",
    people: ["Ada", "Bo", "Cy", "Dee"],
    sites: ["North gate", "Canal gate", "Freight gate", "Clock gate"],
    event: "the conductor crossed the platform",
    minute: 137,
    fast: 17,
    lag: 9,
    word: "TUNNEL",
    sequence: [1, 2, 1, 3, 2],
  },
  {
    id: "silent-calls",
    prefix: "calls",
    title: "The voice on line nine",
    location: "HOLLOW EXCHANGE",
    intro:
      "A call was placed from a dead line. The recording contains a voice answering itself.",
    ending:
      "Pete isolates the line and cuts the relay. The voice cannot follow him through silence.",
    people: ["Eda", "Finn", "Gus", "Hale"],
    sites: ["Switchroom", "Relay room", "Cable room", "Booth nine"],
    event: "the silent call connected",
    minute: 5,
    fast: 23,
    lag: 11,
    word: "LOCKER",
    sequence: [2, 3, 1, 2, 3, 1],
  },
  {
    id: "missing-shadow",
    prefix: "shadow",
    title: "The man without a shadow",
    location: "MERCER STREET",
    intro:
      "One witness saw the man enter a locked building. Three others saw the same coat elsewhere.",
    ending:
      "The witness led Pete to the bridge. At dawn, the stolen shadow returns to its owner.",
    people: ["Iris", "Joss", "Kit", "Lea"],
    sites: ["West arcade", "Canal arch", "Old chapel", "East court"],
    event: "the shadow crossed the square",
    minute: 82,
    fast: 14,
    lag: 16,
    word: "BRIDGE",
    sequence: [3, 1, 2, 3, 1, 1],
  },
  {
    id: "room-zero",
    prefix: "hotel",
    title: "A room that isn’t there",
    location: "THE MARLOW HOTEL",
    intro:
      "Someone checked into a room missing from every floor plan. The night porter has four names.",
    ending:
      "Pete reaches the cellar behind the false floor plan. The guest register shuts by itself.",
    people: ["Mara", "Nell", "Oren", "Pax"],
    sites: ["Service door", "Lobby door", "East stairs", "West stairs"],
    event: "the guest entered the hidden room",
    minute: 163,
    fast: 19,
    lag: 7,
    word: "CELLAR",
    sequence: [1, 3, 2, 2, 3, 1, 2],
  },
  {
    id: "blackout",
    prefix: "blackout",
    title: "Seven seconds of darkness",
    location: "LANTERN DISTRICT",
    intro:
      "The lights failed for seven seconds. When they returned, an entire building was facing the wrong way.",
    ending:
      "Pete opens the breaker cabinet. One relay releases, and the street turns back toward home.",
    people: ["Quinn", "Rafe", "Sela", "Tess"],
    sites: ["Pump house", "North works", "Transformer", "South works"],
    event: "the blackout began",
    minute: 121,
    fast: 11,
    lag: 13,
    word: "SWITCH",
    sequence: [2, 1, 3, 2, 1, 3, 3],
  },
  {
    id: "red-envelope",
    prefix: "letter",
    title: "The letter addressed to Pete",
    location: "BELLWETHER ROW",
    intro:
      "The letter is dated tomorrow. Its four witnesses are listed in yesterday’s obituaries.",
    ending:
      "Pete finds the author’s secret drawer. The letter inside is blank, and the footsteps stop.",
    people: ["Una", "Vale", "Wren", "Yara"],
    sites: ["Postern", "Ash alley", "Green court", "Yew passage"],
    event: "the letter changed hands",
    minute: 94,
    fast: 26,
    lag: 8,
    word: "DRAWER",
    sequence: [3, 2, 1, 3, 2, 1, 3, 2],
  },
  {
    id: "flooded-arcade",
    prefix: "arcade",
    title: "The arcade after closing",
    location: "SAINT ELMO ARCADE",
    intro:
      "The high-score screen names four players. Every cabinet remembers Pete losing here tomorrow.",
    ending:
      "Pete reaches the hidden arcade exit. His name disappears from the high-score table.",
    people: ["Anya", "Bram", "Cora", "Dax"],
    sites: ["Coin room", "West hall", "Screen room", "East hall"],
    event: "the phantom score appeared",
    minute: 28,
    fast: 16,
    lag: 19,
    word: "ARCADE",
    sequence: [1, 2, 3, 1, 2, 3, 1, 2],
  },
];
export const hhmm = (n: number) =>
  `${String(Math.floor((((n % 1440) + 1440) % 1440) / 60)).padStart(2, "0")}:${String(((n % 60) + 60) % 60).padStart(2, "0")}`;
const permutations = <T>(items: T[]): T[][] =>
  items.length
    ? items.flatMap((x, i) =>
        permutations(items.filter((_, j) => i !== j)).map((t) => [x, ...t]),
      )
    : [[]];
export function roomSolutions(names: string[]) {
  return permutations(names).filter(
    (row) =>
      row.indexOf(names[1]) === row.indexOf(names[0]) + 1 &&
      row.indexOf(names[2]) > row.indexOf(names[1]) &&
      [0, 3].includes(row.indexOf(names[3])) &&
      ![0, 3].includes(row.indexOf(names[0])),
  );
}
export function switchSolutions(labels: string[]) {
  return Array.from({ length: 32 }, (_, mask) =>
    labels.map((_, i) => !!(mask & (1 << i))),
  )
    .filter(
      ([a, b, c, d, e]) =>
        a !== b &&
        b === c &&
        c !== d &&
        e === (a && d) &&
        [a, b, c, d, e].filter(Boolean).length === 2,
    )
    .map((bits) =>
      labels
        .filter((_, i) => bits[i])
        .sort()
        .join("+"),
    );
}
export function leverChecksum(sequence: number[]) {
  return sequence.reduce(
    (state, key) => state ^ ({ 1: 6, 2: 3, 3: 4 }[key] ?? 0),
    0,
  );
}
const shift = (text: string, a: number, b: number) =>
  [...text]
    .map((ch, i) =>
      String.fromCharCode(
        65 + ((ch.charCodeAt(0) - 65 + (i % 2 ? b : a) + 52) % 26),
      ),
    )
    .join("");
export const decode = (text: string, a: number, b: number) =>
  [...shift(text, -a, -b)].reverse().join("");
export type Audit = {
  id: string;
  mechanism: string;
  candidates: string[];
  answer: string;
};
export const solutionAudits: Audit[] = [];
function createCase(p: CasePlan, caseIndex: number): Mystery {
  const clues: Clue[] = [];
  function add(
    title: string,
    evidence: string,
    question: string,
    options: string[],
    correct: string,
    explanation: string,
    candidates: string[],
    mechanism: string,
  ) {
    const index = clues.length,
      id = `${p.prefix}-${index + 1}`;
    if (
      options.length !== 4 ||
      new Set(options).size !== 4 ||
      !options.includes(correct)
    )
      throw Error(`${id}: invalid options`);
    const choices = options.map((text, i) => ({
      id: `${id}-${i}`,
      text,
    })) as Clue["choices"];
    clues.push({
      id,
      title,
      evidence,
      question,
      choices,
      answerId: choices.find((c) => c.text === correct)!.id,
      explanation,
      difficulty:
        index < 2
          ? "easy"
          : index < 5
            ? "medium"
            : index < 7
              ? "hard"
              : "final",
      seconds: [40, 45, 50, 55, 60, 65, 70, 75][index],
    });
    solutionAudits.push({ id, mechanism, candidates, answer: correct });
  }
  const gateRows = [
    { number: 14, lamps: 1 },
    { number: 17, lamps: 0 },
    { number: 21, lamps: 1 },
    { number: 28, lamps: 2 },
  ];
  const rotation = caseIndex % 4;
  const gates = p.sites.map((name, i) => ({
    name,
    ...gateRows[(i + rotation) % 4],
  }));
  const possible = gates
    .filter((g) => g.number % 2 === 1 && g.lamps === 1)
    .map((g) => g.name);
  const gate = possible[0];
  add(
    "The unsealed entrance",
    `A maintenance card: “An entrance is unlocked only if its number is odd AND exactly one lamp works.”\n${gates.map((g) => `${g.name}: no. ${g.number}, ${g.lamps} working lamp${g.lamps === 1 ? "" : "s"}`).join("\n")}`,
    "Which entrance could the witness have used?",
    p.sites,
    gate,
    `${gate} is the only entrance satisfying both conditions. An odd number alone or one working lamp alone is not sufficient.`,
    possible,
    "intersection",
  );
  const printed = p.minute + p.fast + p.lag;
  const time = hhmm(p.minute);
  const wrongTimes = [
    hhmm(printed - p.lag),
    hhmm(printed - p.fast),
    hhmm(printed + p.fast - p.lag),
  ];
  add(
    "The recorder’s clock",
    `The recorder displays ${hhmm(printed)} when its report is saved. Its clock is ${p.fast} minutes fast. Reports are saved exactly ${p.lag} minutes after the event.\nThe event: ${p.event}.`,
    "At what real time did the event occur?",
    [wrongTimes[0], time, wrongTimes[1], wrongTimes[2]],
    time,
    `First remove the ${p.fast}-minute clock error, then the ${p.lag}-minute recording delay: ${hhmm(printed)} − ${p.fast} − ${p.lag} = ${time}. Dates wrap at midnight.`,
    [hhmm(printed - p.fast - p.lag)],
    "clock-offset-and-delay",
  );
  const names = [...p.people.slice(rotation), ...p.people.slice(0, rotation)];
  const position = (caseIndex % 3) + 2;
  const rows = roomSolutions(names);
  const assigned = rows[0][position - 1];
  add(
    "The witness rooms",
    `Four rooms run west to east: 1, 2, 3, 4. One witness per room.\n${names[1]} was immediately east of ${names[0]}.\n${names[2]} was east of ${names[1]}.\n${names[3]} occupied an end room.\n${names[0]} was not in an end room.`,
    `Who occupied room ${position}?`,
    p.people,
    assigned,
    `The only west-to-east arrangement is ${rows[0].join(" → ")}. ${assigned} therefore occupied room ${position}.`,
    rows.map((r) => r[position - 1]),
    "permutation",
  );
  const odd = 2 + (caseIndex % 3),
    even = 5 + (caseIndex % 3);
  const encrypted = shift([...p.word].reverse().join(""), odd, even);
  const wordPool = [
    "TUNNEL",
    "LOCKER",
    "BRIDGE",
    "CELLAR",
    "SWITCH",
    "DRAWER",
    "ARCADE",
  ];
  const wordOptions = [
    p.word,
    ...wordPool
      .filter((w) => w !== p.word)
      .slice(caseIndex % 3, (caseIndex % 3) + 3),
  ];
  add(
    "The damaged strip",
    `A six-letter strip reads ${encrypted}. Count positions from 1.\nThe odd-position forward shift equals ${names[caseIndex % 3]}’s room number from page 3. The even-position shift is 3 greater. Undo those shifts, wrapping A–Z, THEN read backwards.`,
    "Which place does the strip identify?",
    wordOptions,
    p.word,
    `The room assignment gives shifts ${odd} and ${even}. Undoing those alternating shifts gives ${[...p.word].reverse().join("")}; reversing that gives ${p.word}. Applying the reversal first would use the shifts on the wrong positions.`,
    [decode(encrypted, odd, even)],
    "alternating-cipher-and-reversal",
  );
  // All routes are directed. A has paths of11 or12 minutes; B has7; C has5.
  const travel = [
    { node: "A", depart: p.minute - 10, paths: [11, 12] },
    { node: "B", depart: p.minute - 7, paths: [7] },
    { node: "C", depart: p.minute - 4, paths: [5] },
    { node: "A", depart: p.minute - 14, paths: [11, 12] },
  ];
  const logs = p.people.map((name, i) => ({
    name,
    ...travel[(i + rotation) % 4],
  }));
  const witnesses = logs
    .filter((log) =>
      log.paths.some((t) => (log.depart + t + 1440) % 1440 === p.minute),
    )
    .map((log) => log.name);
  const witness = witnesses[0];
  add(
    "A route that fits",
    `Use the real event time from page 2. One-way passages: A→B 4 min; A→C 7 min; B→C 2 min; C→Exit 5 min. No other passages. Nobody stopped or revisited a room.\n${logs.map((l) => `${l.name}: left ${l.node} at ${hhmm(l.depart)} real time`).join("\n")}`,
    "Who could have reached the Exit at the exact event time?",
    p.people,
    witness,
    `The event was at ${time}. From A the possible journey lengths are 11 or 12 minutes, from B 7, and from C 5. Only ${witness} has a departure and legal route ending at ${time}.`,
    witnesses,
    "directed-path-and-alibi",
  );
  const letters = ["A", "B", "C", "D", "E"];
  const labels = [
    ...letters.slice(caseIndex % 5),
    ...letters.slice(0, caseIndex % 5),
  ];
  const [a, b, c, d, e] = labels;
  const powered = switchSolutions(labels);
  const pair = powered[0];
  const pairs = [
    pair,
    [a, d].sort().join("+"),
    [a, e].sort().join("+"),
    [d, e].sort().join("+"),
  ];
  add(
    "The interlock",
    `Five switches ${letters.join(", ")}. Exactly TWO must be ON.\n${a} and ${b} must differ. ${b} and ${c} must match.\n${c} and ${d} must differ.\n${e} is ON if and only if BOTH ${a} and ${d} are ON.`,
    "Which pair can be powered without tripping the lock?",
    pairs,
    pair,
    `There are only two states satisfying the first four relationships. One has three switches ON and trips the lock; the other has exactly two: ${pair}.`,
    powered,
    "boolean-interlock",
  );
  const checksum = leverChecksum(p.sequence);
  const checksumOptions = [
    checksum,
    (checksum + 3) % 8,
    (checksum + 1) % 8,
    (checksum + 6) % 8,
  ].map(String);
  add(
    "The memory relay",
    `Three indicators A, B, C start OFF. Button 1 toggles A and B. Button 2 toggles B and C. Button 3 toggles A.\nPress, in order: ${p.sequence.join(" → ")}. Every press counts, including repeats.\nAt the end, add 4 for A ON, 2 for B ON, 1 for C ON.`,
    "What checksum remains after the complete sequence?",
    checksumOptions,
    String(checksum),
    `Track ON/OFF changes or cancel identical button presses in pairs. The final indicators encode ${checksum} (${checksum & 4 ? "A ON" : "A OFF"}, ${checksum & 2 ? "B ON" : "B OFF"}, ${checksum & 1 ? "C ON" : "C OFF"}).`,
    [String(p.sequence.reduce((mask, key) => mask ^ [0, 6, 3, 4][key], 0))],
    "stateful-toggle-sequence",
  );
  const code = `${gate[0]}/${time}/${witness[0]}/${p.word.slice(0, 2)}/${pair}/${checksum}`;
  const decoy1 = `${gate[0]}/${wrongTimes[0]}/${assigned[0]}/${p.word.slice(0, 2)}/${pair}/${checksum}`;
  const decoy2 = `${p.sites.find((s) => s !== gate)![0]}/${time}/${witness[0]}/${wordOptions[1].slice(0, 2)}/${pairs[1]}/${checksum}`;
  const decoy3 = `${gate[0]}/${wrongTimes[1]}/${witness[0]}/${p.word.slice(0, 2)}/${pair}/${(checksum + 1) % 8}`;
  add(
    "One way home",
    `The door accepts six fields in this order:\nENTRANCE INITIAL / REAL EVENT TIME / EXIT WITNESS INITIAL / FIRST TWO DECODED LETTERS / POWERED PAIR (A–Z) / RELAY CHECKSUM.\nYour solved pages are available under Earlier pages.`,
    "Which complete code is consistent with the entire case?",
    [decoy1, decoy2, code, decoy3],
    code,
    `${gate} was the unsealed entrance; ${time} came from the corrected recorder; ${witness} alone could reach the Exit; the strip named ${p.word}; the interlock allowed ${pair}; the relay ended at ${checksum}. Every field must agree.`,
    [
      `${gate[0]}/${time}/${witness[0]}/${decode(encrypted, odd, even).slice(0, 2)}/${switchSolutions(labels)[0]}/${leverChecksum(p.sequence)}`,
    ],
    "cross-page-synthesis",
  );
  return {
    id: p.id,
    title: p.title,
    location: p.location,
    intro: p.intro,
    ending: p.ending,
    clues,
  };
}
export const mysteries = plans.map(createCase);
export const mysteryById = Object.fromEntries(mysteries.map((m) => [m.id, m]));
