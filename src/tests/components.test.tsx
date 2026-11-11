import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayScreen } from "../screens/PlayScreen";
import { makeRun } from "../game/daily";
import { ClaimGroup } from "../components/game/ClaimGroup";
import { SealControl } from "../components/game/SealControl";
import { RevealPanel } from "../components/game/RevealPanel";
import { letterById } from "../content/letters";
import { ResultsScreen } from "../screens/ResultsScreen";
import { complete } from "./fixtures";
// Test helpers stay outside the runtime bundle.
describe("paper interactions", () => {
  it("disables stamp until a claim is selected", () => {
    render(
      <PlayScreen
        run={{ ...makeRun("practice"), phase: "answering" }}
        dispatch={vi.fn()}
        reduced
        onPause={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /RETURN TO SENDER/ }),
    ).toBeDisabled();
  });
  it("radio has keyboard arrow and space behavior", async () => {
    const user = userEvent.setup(),
      run = makeRun("daily"),
      select = vi.fn();
    render(
      <ClaimGroup
        puzzle={letterById[run.letters[0].puzzleId]}
        played={run.letters[0]}
        selected={null}
        onSelect={select}
      />,
    );
    await user.tab();
    expect(screen.getAllByRole("radio")[0]).toHaveFocus();
    await user.keyboard("[ArrowDown>]");
    await waitFor(() =>
      expect(select).toHaveBeenCalledWith(run.letters[0].claimIds[1]),
    );
    await user.keyboard("[/ArrowDown] ");
    expect(screen.getAllByRole("radio")[1]).toHaveFocus();
  });
  it("does not arm spent seals", () => {
    render(
      <SealControl
        seals={0}
        armed={false}
        disabled={false}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("No wax seals remaining.")).toBeVisible();
  });
  it.each([true, false])("labels reveal outcome %s accurately", (correct) => {
    const run = makeRun("daily"),
      p = letterById[run.letters[0].puzzleId];
    render(
      <RevealPanel
        puzzle={p}
        answer={{
          puzzleId: p.id,
          choice: p.claims[0].id,
          correct,
          sealed: false,
          points: correct ? 100 : 0,
          timeout: false,
        }}
      />,
    );
    expect(
      screen.getByRole("heading", {
        name: correct ? "Lie intercepted" : "That one slipped through",
      }),
    ).toBeVisible();
    expect(screen.getByRole("link")).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });
  it("shows selectable receipt only when clipboard fails", async () => {
    const user = userEvent.setup(),
      notify = vi.fn();
    render(
      <ResultsScreen
        run={complete()}
        unlocks={[]}
        onReview={vi.fn()}
        onPractice={vi.fn()}
        onHome={vi.fn()}
        onDaily={vi.fn()}
        notify={notify}
      />,
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(Error()) },
    });
    await user.click(
      screen.getByRole("button", { name: /Copy shift receipt/ }),
    );
    expect(
      screen.getByRole("textbox", { name: "Shareable shift receipt" }),
    ).toBeVisible();
    expect(notify).toHaveBeenCalledWith(
      "Copy wasn’t available. Select the receipt below.",
    );
  });
  it("reports clipboard success only after resolved write", async () => {
    const user = userEvent.setup(),
      notify = vi.fn(),
      writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <ResultsScreen
        run={complete()}
        unlocks={[]}
        onReview={vi.fn()}
        onPractice={vi.fn()}
        onHome={vi.fn()}
        onDaily={vi.fn()}
        notify={notify}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: /Copy shift receipt/ }),
    );
    expect(writeText).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledWith("Copied to clipboard");
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
