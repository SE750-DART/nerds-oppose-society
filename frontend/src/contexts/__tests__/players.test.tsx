import React from "react";
import { PlayersProvider, usePlayers } from "../players";
import { render } from "@testing-library/react";
import ProviderWrapper from "../../utils/testing/ProviderWrapper";

const PlayerWrapper = () => <ProviderWrapper Provider={PlayersProvider} />;

describe("usePlayers()", () => {
  const Component = () => {
    const { players, host } = usePlayers();
    expect(players).toEqual([]);
    expect(host).toBe("");
    return <></>;
  };

  it("returns players context when used inside PlayerProvider", () => {
    render(<Component />, { wrapper: PlayerWrapper });
  });

  it("throws error when used outside PlayerProvider", () => {
    /*
    Note: This throws an error in the test console:
    Uncaught [Error: usePlayers() must be used within a PlayersProvider]
    There does not appear to be a way to disable this however the test is caught
    in the code below - nothing to see here!
     */
    expect(() => render(<Component />)).toThrow(
      "usePlayers() must be used within a PlayersProvider"
    );
  });
});
