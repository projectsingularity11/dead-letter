import { RubberStamp } from "../../art/PostalArt";
import * as Radio from "@radix-ui/react-radio-group";
import type { Answer, LetterPuzzle, PlayedLetter } from "../../game/types";
export function ClaimGroup({
  puzzle,
  played,
  selected,
  onSelect,
  locked = false,
  answer,
  stamping = false,
}: {
  puzzle: LetterPuzzle;
  played: PlayedLetter;
  selected: string | null;
  onSelect: (id: string) => void;
  locked?: boolean;
  answer?: Answer;
  stamping?: boolean;
}) {
  return (
    <Radio.Root
      className="claims"
      aria-label="Choose the false statement"
      value={selected ?? ""}
      onValueChange={onSelect}
      disabled={locked}
    >
      {played.claimIds.map((id, i) => {
        const claim = puzzle.claims.find((c) => c.id === id)!;
        const isFalse = !!answer && id === puzzle.falseClaimId;
        const wrong = !!answer && answer.choice === id && !answer.correct;
        return (
          <Radio.Item
            key={id}
            value={id}
            className={`claim ${isFalse ? "claim-false" : ""} ${wrong ? "claim-wrong" : ""}`}
          >
            {stamping && selected === id && (
              <span className="active-stamp" aria-hidden="true">
                <RubberStamp />
              </span>
            )}
            <span className="claim-marker">{"ABCD"[i]}</span>
            <span className="claim-copy">
              {claim.text}
              {isFalse && (
                <strong className="claim-annotation">
                  The false statement
                </strong>
              )}
              {wrong && (
                <strong className="claim-annotation">Your choice</strong>
              )}
            </span>
            <span className="radio-indicator" aria-hidden="true">
              {isFalse ? "✓" : wrong ? "×" : <Radio.Indicator />}
            </span>
          </Radio.Item>
        );
      })}
    </Radio.Root>
  );
}
