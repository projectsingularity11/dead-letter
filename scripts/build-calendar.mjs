import { writeFileSync } from "node:fs";
const districts = [
  "Briar Station",
  "Hollow Exchange",
  "Mercer Street",
  "Marlow Hotel",
  "Lantern Works",
  "Bellwether Row",
  "Saint Elmo Arcade",
  "Canal Observatory",
  "North Quay",
  "Ash Archive",
];
const objects = [
  "The borrowed hour",
  "The missing passenger",
  "The second key",
  "The impossible delivery",
  "The last light",
  "The empty photograph",
  "The midnight receipt",
  "The vanished room",
  "The unclaimed voice",
  "The locked reflection",
];
const premises = [
  "A departure is stamped before its passenger arrived. Someone altered the station record.",
  "A dead telephone rang from inside a sealed booth. Its caller left a trail of service slips.",
  "A witness entered a boarded-up shop. Four people remember a different entrance.",
  "A guest left a key for a room absent from the hotel plan. The porter hid the original register.",
  "The district went dark. One maintenance route stayed open throughout the blackout.",
  "A letter addressed to Pete arrived with tomorrow’s postmark. Its sender wants the delivery record erased.",
  "An unplugged cabinet printed a receipt. Its final player walked out before the score appeared.",
  "The observatory recorded a light below the canal. Someone moved the night watch’s equipment.",
  "A ferry docked without a crew. Four witnesses left conflicting time-stamped route cards.",
  "A sealed file contains Pete’s signature. The archive’s own records conceal who brought it in.",
];
const start = Date.UTC(2026, 10, 13);
const calendar = Array.from({ length: 100 }, (_, i) => {
  const district = i % 10,
    episode = Math.floor(i / 10),
    date = new Date(start + i * 86400000).toISOString().slice(0, 10);
  return {
    id: `case-${date}`,
    date,
    number: i + 1,
    seed: 23117 + i * 7919,
    title: `${objects[episode]} at ${districts[district]}`,
    location: districts[district].toUpperCase(),
    intro: premises[district],
    variant: (district + episode) % 4,
  };
});
writeFileSync(
  "src/night/content/calendar.json",
  JSON.stringify(calendar, null, 2) + "\n",
);
console.log(
  `Scheduled ${calendar.length} cases: ${calendar[0].date} to ${calendar.at(-1).date}`,
);
