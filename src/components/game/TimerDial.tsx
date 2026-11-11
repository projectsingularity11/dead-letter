export function TimerDial({ remaining }: { remaining: number }) {
  const seconds = Math.ceil(remaining / 1000);
  return (
    <div
      className={`timer ${seconds <= 5 ? "urgent" : seconds <= 10 ? "warning" : ""}`}
      role="timer"
      aria-label={`${seconds} seconds remaining`}
    >
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" opacity=".2" />
        <circle
          cx="20"
          cy="20"
          r="17"
          pathLength="100"
          strokeDasharray={`${remaining / 250} 100`}
          transform="rotate(-90 20 20)"
        />
      </svg>
      <b aria-hidden="true">{seconds}</b>
      {seconds <= 5 && <span>Time remaining</span>}
    </div>
  );
}
