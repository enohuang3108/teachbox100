import { beforeEach, describe, expect, it } from "vitest";
import { useMonopolyStore } from "./store";

const Q = [{ id: "q1", type: "boolean" as const, text: "x", answer: "是" }];

beforeEach(() => {
  useMonopolyStore.setState({
    game: null,
    draftQuestions: [],
    draftPlayers: [],
    draftSettings: useMonopolyStore.getState().draftSettings,
  });
});

describe("store", () => {
  it("begin 需要題庫與至少兩位玩家", () => {
    const s = useMonopolyStore.getState();
    s.begin();
    expect(useMonopolyStore.getState().game).toBeNull();

    s.importQuestions(Q);
    s.setPlayers([
      { name: "A", color: "#f00", character: "capybara" },
      { name: "B", color: "#00f", character: "quokka" },
    ]);
    useMonopolyStore.getState().begin();
    expect(useMonopolyStore.getState().game?.phase).toBe("playing");
  });

  it("roll 在有 pendingAction 時不動作", () => {
    const s = useMonopolyStore.getState();
    s.importQuestions(Q);
    s.setPlayers([
      { name: "A", color: "#f00", character: "capybara" },
      { name: "B", color: "#00f", character: "quokka" },
    ]);
    useMonopolyStore.getState().begin();
    useMonopolyStore.getState().roll();
    const after = useMonopolyStore.getState().game!;
    expect(after.lastRoll).not.toBeNull();
  });
});
