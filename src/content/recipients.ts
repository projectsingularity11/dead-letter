import type { Category } from "../game/types";
export const recipients: Record<
  Category,
  { id: string; name: string; address: string; label: string }
> = {
  space: {
    id: "vesper",
    name: "Professor Vesper",
    address: "Observatory, Last Window Before Dawn",
    label: "Space",
  },
  animals: {
    id: "moss",
    name: "Mabel Moss",
    address: "The Greenhouse Beyond the Gate",
    label: "Animals",
  },
  geography: {
    id: "elsewhere",
    name: "Captain Elsewhere",
    address: "Platform Zero, Elsewhere Station",
    label: "Geography",
  },
  language: {
    id: "ink",
    name: "Ada Ink",
    address: "Room 4, The Unfinished Library",
    label: "Language",
  },
  science: {
    id: "spark",
    name: "Doctor Spark",
    address: "Laboratory Beneath the Lamplight",
    label: "Science",
  },
  culture: {
    id: "encore",
    name: "Madame Encore",
    address: "Balcony Seat, The Silent Theatre",
    label: "Arts & history",
  },
};
