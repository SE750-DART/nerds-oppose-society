import { renderHook } from "@testing-library/react-hooks";
import { RoundProvider, useRound } from "../round";

describe("useRound()", () => {
  it("returns rounds context when used inside RoundProvider", () => {
    const { result } = renderHook(() => useRound(), { wrapper: RoundProvider });

    const {
      roundNumber,
      setup,
      numPlayersChosen,
      punchlinesChosen,
      hostViewIndex,
      winner,
    } = result.current;
    expect(roundNumber).toBe(0);
    expect(setup).toEqual({ setup: "", type: "PICK_ONE" });
    expect(numPlayersChosen).toBe(0);
    expect(punchlinesChosen).toEqual([]);
    expect(hostViewIndex).toBe(0);
    expect(winner).toEqual({ winningPlayerId: "", winningPunchlines: [] });
  });

  it("throws error when used outside RoundProvider", () => {
    const { result } = renderHook(() => useRound());

    expect(result.error).toEqual(
      Error("useRound() must be used within a RoundProvider")
    );
  });
});
