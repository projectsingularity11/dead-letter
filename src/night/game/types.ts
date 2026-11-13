export type Difficulty = "easy" | "medium" | "hard" | "final";
export type AnswerField = {
  label: string;
  hint: string;
  answer: string;
  kind: "text" | "number" | "time" | "set" | "code";
};
export type Clue = {
  id: string;
  title: string;
  evidence: string;
  question: string;
  fields: AnswerField[];
  explanation: string;
  difficulty: Difficulty;
  seconds: number;
  mechanism: string;
  solutions: string[][];
};
export type Mystery = {
  id: string;
  date: string;
  number: number;
  title: string;
  location: string;
  intro: string;
  ending: string;
  clues: Clue[];
};
export type Phase =
  "intro" | "walking" | "answering" | "banished" | "caught" | "escaped";
export type Answer = {
  clueId: string;
  values: string[];
  correct: boolean;
  remaining: number;
};
export type Run = {
  id: string;
  date: string;
  mode: "daily" | "practice" | "tutorial";
  mysteryId: string;
  phase: Phase;
  clue: number;
  remaining: number;
  misses: string[];
  answers: Answer[];
  score: number;
  paused: boolean;
};
export type Preferences = {
  sound: boolean;
  motion: "system" | "reduced" | "full";
};
export type Save = {
  version: 4;
  active: Run | null;
  daily: Record<string, Run>;
  practice: Run | null;
  best: number;
  tutorialComplete: boolean;
  preferences: Preferences;
};
export type Overlay = "pause" | "settings" | "how" | "casebook" | null;
