import { renderHook } from "@testing-library/react-hooks";
import { PlayersProvider, usePlayers } from "../players";

describe("usePlayers()", () => {
  it("returns players context when used inside PlayerProvider", () => {
    const { result } = renderHook(() => usePlayers(), {
      wrapper: PlayersProvider,
    });

    const { players, host } = result.current;
    expect(players).toEqual([]);
    expect(host).toBe("");
  });

  it("throws error when used outside PlayerProvider", () => {
    const { result } = renderHook(() => usePlayers());

    expect(result.error).toEqual(
      Error("usePlayers() must be used within a PlayersProvider")
    );
  });
});
