import { WaxSeal } from "../../art/PostalArt";
export function SealControl({
  seals,
  armed,
  onToggle,
  disabled,
}: {
  seals: number;
  armed: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      className="seal-control"
      aria-pressed={armed}
      disabled={disabled || seals === 0}
      onClick={onToggle}
    >
      <span className="seal-pair">
        <WaxSeal className={seals < 1 ? "spent" : ""} />
        <WaxSeal className={seals < 2 ? "spent" : ""} />
      </span>
      <span>
        <strong>{armed ? "Wax seal armed" : "Use a wax seal"}</strong>
        <small>Double the points if you’re right.</small>
        <small>
          {seals === 0 ? "No wax seals remaining." : `${seals} remaining`}
        </small>
      </span>
    </button>
  );
}
