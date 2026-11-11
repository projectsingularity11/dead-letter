export const categories = [
  "space",
  "animals",
  "geography",
  "language",
  "science",
  "culture",
] as const;
export type Category = (typeof categories)[number];
export type LetterPuzzle = {
  id: string;
  category: Category;
  difficulty: "easy" | "medium" | "hard";
  recipientId: string;
  claims: [
    { id: string; text: string },
    { id: string; text: string },
    { id: string; text: string },
    { id: string; text: string },
  ];
  falseClaimId: string;
  correction: string;
  explanation: string;
  sources: { title: string; url: string; supportedClaimIds: string[] }[];
  verificationStatus: "source-checked" | "needs-editorial-review";
  reactionCorrect: string;
  reactionIncorrect: string;
};
export type Mode = "daily" | "practice" | "relaxed";
export type Phase =
  | "home"
  | "tutorial"
  | "opening"
  | "answering"
  | "stamping"
  | "reveal"
  | "transitioning"
  | "results";
export type PlayedLetter = { puzzleId: string; claimIds: string[] };
export type Answer = {
  puzzleId: string;
  choice: string | null;
  correct: boolean;
  sealed: boolean;
  points: number;
  timeout: boolean;
};
export type Run = {
  id: string;
  date: string;
  mode: Mode;
  letters: PlayedLetter[];
  phase: Phase;
  round: number;
  answers: Answer[];
  remaining: number;
  score: number;
  seals: number;
  armed: boolean;
  selected: string | null;
  paused: boolean;
};
export type Preferences = {
  sound: boolean;
  atmosphere: boolean;
  motion: "system" | "reduced" | "full";
};
export type Modal =
  "settings" | "about" | "collection" | "review" | "resume" | "tutorial" | null;
export type Records = {
  version: 1;
  activeId?: string;
  daily: Record<string, Run>;
  practice: Run | null;
  completedDates: string[];
  collection: string[];
  preferences: Preferences;
  tutorialDone: boolean;
  recent: Partial<Record<Category, string>>;
};
