import { useEffect, useState } from "react";
import { untilMidnight, utcDate } from "../game/rules";
export function useDailyClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let midnight: ReturnType<typeof setTimeout>;
    const update = () => {
      setNow(new Date());
      clearTimeout(midnight);
      midnight = setTimeout(update, untilMidnight() + 10);
    };
    update();
    const tick = setInterval(() => setNow(new Date()), 1000);
    const visible = () => {
      if (!document.hidden) update();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(tick);
      clearTimeout(midnight);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  const seconds = Math.ceil(untilMidnight(now) / 1000);
  return {
    today: utcDate(now),
    countdown: [
      Math.floor(seconds / 3600),
      Math.floor(seconds / 60) % 60,
      seconds % 60,
    ]
      .map((n) => String(n).padStart(2, "0"))
      .join(":"),
  };
}
