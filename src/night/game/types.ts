export type Difficulty = "easy" | "medium" | "hard" | "final";
export type Choice = { id: string; text: string };
export type Clue = {
  id: string;
  title: string;
  evidence: string;
  question: string;
  choices: [Choice, Choice, Choice, Choice];
  answerId: string;
  explanation: string;
  difficulty: Difficulty;
  seconds: number;
};
export type Mystery = {
  id: string;
  title: string;
  location: string;
  intro: string;
  ending: string;
  clues: Clue[];
};
export type Phase = "walking" | "answering" | "banished" | "caught" | "escaped";
export type Answer = {
  clueId: string;
  choiceId: string;
  correct: boolean;
  remaining: number;
};
export type Run = {
  id: string;
  date: string;
  mode: "daily" | "practice";
  mysteryId: string;
  phase: Phase;
  clue: number;
  remaining: number;
  misses: string[];
  choiceOrder: string[][];
  answers: Answer[];
  score: number;
  paused: boolean;
};
export type Preferences = {
  sound: boolean;
  motion: "system" | "reduced" | "full";
};
export type Save = {
  version: 3;
  active: Run | null;
  daily: Record<string, Run>;
  practice: Run | null;
  best: number;
  preferences: Preferences;
};
export type Overlay = "pause" | "settings" | "how" | "casebook" | null;
