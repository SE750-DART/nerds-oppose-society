import React from "react";
import { render } from "@testing-library/react";
import { RoundProvider, useRound } from "../round";

describe("useRound()", () => {
  const Component = () => {
    const {
      roundNumber,
      setup,
      numPlayersChosen,
      punchlinesChosen,
      hostViewIndex,
      winner,
    } = useRound();
    expect(roundNumber).toBe(0);
    expect(setup).toEqual({ setup: "", type: "PICK_ONE" });
    expect(numPlayersChosen).toBe(0);
    expect(punchlinesChosen).toEqual([]);
    expect(hostViewIndex).toBe(0);
    expect(winner).toEqual({ winningPlayerId: "", winningPunchlines: [] });
    return <></>;
  };

  it("returns rounds context when used inside RoundProvider", () => {
    render(<Component />, { wrapper: RoundProvider });
  });

  it("throws error when used outside RoundProvider", () => {
    /*
    Note: This throws an error in the test console:
    Uncaught [Error: useRound() must be used within a RoundProvider]
    There does not appear to be a way to disable this however the test is caught
    in the code below - nothing to see here!
     */
    expect(() => render(<Component />)).toThrow(
      "useRound() must be used within a RoundProvider"
    );
  });
});
