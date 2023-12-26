import { act, renderHook, RenderResult } from "@testing-library/react";
import { RoundAction, RoundProvider, useRound } from "../round";

describe("useRound()", () => {
  it("returns rounds context when used inside RoundProvider", () => {
    const { result } = renderHook(() => useRound(), { wrapper: RoundProvider });

    const [
      { roundNumber, setup, numPlayersChosen, chosenPunchlines, winner },
      dispatch,
    ] = result.current;
    expect(roundNumber).toBe(0);
    expect(setup).toBeUndefined();
    expect(numPlayersChosen).toBe(0);
    expect(chosenPunchlines).toEqual([]);
    expect(winner).toBeUndefined();
    expect(dispatch).toBeDefined();
  });

  it("throws error when used outside RoundProvider", () => {
    const { result } = renderHook(() => useRound());

    expect(result.error).toEqual(
      Error("useRound() must be used within a RoundProvider")
    );
  });

  describe("dispatch()", () => {
    const setupRound = (result: RenderResult<ReturnType<typeof useRound>>) => {
      const [, dispatch] = result.current;
      act(() => {
        dispatch({ type: RoundAction.NEW_ROUND, roundNumber: 1 });
        dispatch({
          type: RoundAction.SET_SETUP,
          setup: {
            setup: "What is the best funny number?",
            type: "PICK_ONE",
          },
        });
        dispatch({ type: RoundAction.INCREMENT_PLAYERS_CHOSEN });
        dispatch({ type: RoundAction.INCREMENT_PLAYERS_CHOSEN });
        dispatch({
          type: RoundAction.SET_CHOSEN_PUNCHLINES,
          punchlines: [["420"], ["69"]],
        });
        dispatch({
          type: RoundAction.SET_WINNER,
          winningPlayerId: "420",
          winningPunchlines: ["420"],
        });
      });

      const [
        { roundNumber, setup, numPlayersChosen, chosenPunchlines, winner },
      ] = result.current;
      expect(roundNumber).toBe(1);
      expect(setup).toEqual({
        setup: "What is the best funny number?",
        type: "PICK_ONE",
      });
      expect(numPlayersChosen).toBe(2);
      expect(chosenPunchlines).toEqual([
        { text: "420", viewed: false },
        { text: "69", viewed: false },
      ]);
      expect(winner).toEqual({
        winningPlayerId: "420",
        winningPunchlines: ["420"],
      });
    };

    describe("NEW_ROUND", () => {
      it("resets existing state and sets roundNumber", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });
        setupRound(result);

        const [, dispatch] = result.current;
        act(() => dispatch({ type: RoundAction.NEW_ROUND, roundNumber: 2 }));

        const [
          { roundNumber, setup, numPlayersChosen, chosenPunchlines, winner },
        ] = result.current;
        expect(roundNumber).toBe(2);
        expect(setup).toBeUndefined();
        expect(numPlayersChosen).toBe(0);
        expect(chosenPunchlines).toEqual([]);
        expect(winner).toBeUndefined();
      });
    });

    describe("SET_SETUP", () => {
      it("sets the setup for the round", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.SET_SETUP,
            setup: {
              setup: "Why did the chicken cross the road?",
              type: "PICK_ONE",
            },
          })
        );

        const [{ setup }] = result.current;
        expect(setup).toEqual({
          setup: "Why did the chicken cross the road?",
          type: "PICK_ONE",
        });
      });

      it("sets the setup for the round without effecting other state", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });
        setupRound(result);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.SET_SETUP,
            setup: {
              setup: "Why did the chicken cross the road?",
              type: "PICK_ONE",
            },
          })
        );

        const [
          { roundNumber, setup, numPlayersChosen, chosenPunchlines, winner },
        ] = result.current;
        expect(roundNumber).toBe(1);
        expect(setup).toEqual({
          setup: "Why did the chicken cross the road?",
          type: "PICK_ONE",
        });
        expect(numPlayersChosen).toBe(2);
        expect(chosenPunchlines).toEqual([
          { text: "420", viewed: false },
          { text: "69", viewed: false },
        ]);
        expect(winner).toEqual({
          winningPlayerId: "420",
          winningPunchlines: ["420"],
        });
      });
    });

    describe("INCREMENT_PLAYERS_CHOSEN", () => {
      it("increments players chosen", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.INCREMENT_PLAYERS_CHOSEN,
          })
        );

        const [{ numPlayersChosen }] = result.current;
        expect(numPlayersChosen).toBe(1);
      });

      it("increments players chosen without effecting other state", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });
        setupRound(result);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.INCREMENT_PLAYERS_CHOSEN,
          })
        );

        const [
          { roundNumber, setup, numPlayersChosen, chosenPunchlines, winner },
        ] = result.current;
        expect(roundNumber).toBe(1);
        expect(setup).toEqual({
          setup: "What is the best funny number?",
          type: "PICK_ONE",
        });
        expect(numPlayersChosen).toBe(3);
        expect(chosenPunchlines).toEqual([
          { text: "420", viewed: false },
          { text: "69", viewed: false },
        ]);
        expect(winner).toEqual({
          winningPlayerId: "420",
          winningPunchlines: ["420"],
        });
      });
    });

    describe("SET_CHOSEN_PUNCHLINES", () => {
      it("sets chosen punchlines", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.SET_CHOSEN_PUNCHLINES,
            punchlines: [["To get to the other side"], ["To go to KFC"]],
          })
        );

        const [{ chosenPunchlines }] = result.current;
        expect(chosenPunchlines).toEqual([
          { text: "To get to the other side", viewed: false },
          { text: "To go to KFC", viewed: false },
        ]);
      });

      it("sets chosen punchlines without effecting other state", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });
        setupRound(result);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.SET_CHOSEN_PUNCHLINES,
            punchlines: [["To get to the other side"], ["To go to KFC"]],
          })
        );

        const [
          { roundNumber, setup, numPlayersChosen, chosenPunchlines, winner },
        ] = result.current;
        expect(roundNumber).toBe(1);
        expect(setup).toEqual({
          setup: "What is the best funny number?",
          type: "PICK_ONE",
        });
        expect(numPlayersChosen).toBe(2);
        expect(chosenPunchlines).toEqual([
          { text: "To get to the other side", viewed: false },
          { text: "To go to KFC", viewed: false },
        ]);
        expect(winner).toEqual({
          winningPlayerId: "420",
          winningPunchlines: ["420"],
        });
      });
    });

    describe("MARK_PUNCHLINE_READ", () => {
      it("marks chosen punchline read", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.SET_CHOSEN_PUNCHLINES,
            punchlines: [["To get to the other side"], ["To go to KFC"]],
          })
        );
        act(() =>
          dispatch({
            type: RoundAction.MARK_PUNCHLINE_READ,
            index: 1,
          })
        );

        const [{ chosenPunchlines }] = result.current;
        expect(chosenPunchlines).toEqual([
          { text: "To get to the other side", viewed: false },
          { text: "To go to KFC", viewed: true },
        ]);
      });

      it("marks chosen punchline read without effecting other state", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });
        setupRound(result);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.MARK_PUNCHLINE_READ,
            index: 1,
          })
        );

        const [
          { roundNumber, setup, numPlayersChosen, chosenPunchlines, winner },
        ] = result.current;
        expect(roundNumber).toBe(1);
        expect(setup).toEqual({
          setup: "What is the best funny number?",
          type: "PICK_ONE",
        });
        expect(numPlayersChosen).toBe(2);
        expect(chosenPunchlines).toEqual([
          { text: "420", viewed: false },
          { text: "69", viewed: true },
        ]);
        expect(winner).toEqual({
          winningPlayerId: "420",
          winningPunchlines: ["420"],
        });
      });

      it("does not modify state if index is less than 0", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.SET_CHOSEN_PUNCHLINES,
            punchlines: [["To get to the other side"], ["To go to KFC"]],
          })
        );
        const [initialState] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.MARK_PUNCHLINE_READ,
            index: -1,
          })
        );

        const [state] = result.current;
        const { chosenPunchlines } = state;
        expect(chosenPunchlines).toEqual([
          { text: "To get to the other side", viewed: false },
          { text: "To go to KFC", viewed: false },
        ]);
        expect(state).toBe(initialState);
      });

      it("does not modify state if index is equal to the length of chosenPunchlines", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.SET_CHOSEN_PUNCHLINES,
            punchlines: [["To get to the other side"], ["To go to KFC"]],
          })
        );
        const [initialState] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.MARK_PUNCHLINE_READ,
            index: 2,
          })
        );

        const [state] = result.current;
        const { chosenPunchlines } = state;
        expect(chosenPunchlines).toEqual([
          { text: "To get to the other side", viewed: false },
          { text: "To go to KFC", viewed: false },
        ]);
        expect(state).toBe(initialState);
      });

      it("does not modify state if index exceeds the length of chosenPunchlines", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.SET_CHOSEN_PUNCHLINES,
            punchlines: [["To get to the other side"], ["To go to KFC"]],
          })
        );
        const [initialState] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.MARK_PUNCHLINE_READ,
            index: 3,
          })
        );

        const [state] = result.current;
        const { chosenPunchlines } = state;
        expect(chosenPunchlines).toEqual([
          { text: "To get to the other side", viewed: false },
          { text: "To go to KFC", viewed: false },
        ]);
        expect(state).toBe(initialState);
      });
    });

    describe("SET_WINNER", () => {
      it("sets the winner", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.SET_WINNER,
            winningPlayerId: "123",
            winningPunchlines: ["To go to KFC"],
          })
        );

        const [{ winner }] = result.current;
        expect(winner).toEqual({
          winningPlayerId: "123",
          winningPunchlines: ["To go to KFC"],
        });
      });

      it("sets the winner without effecting other state", () => {
        const { result } = renderHook(() => useRound(), {
          wrapper: RoundProvider,
        });
        setupRound(result);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: RoundAction.SET_WINNER,
            winningPlayerId: "123",
            winningPunchlines: ["To go to KFC"],
          })
        );

        const [
          { roundNumber, setup, numPlayersChosen, chosenPunchlines, winner },
        ] = result.current;
        expect(roundNumber).toBe(1);
        expect(setup).toEqual({
          setup: "What is the best funny number?",
          type: "PICK_ONE",
        });
        expect(numPlayersChosen).toBe(2);
        expect(chosenPunchlines).toEqual([
          { text: "420", viewed: false },
          { text: "69", viewed: false },
        ]);
        expect(winner).toEqual({
          winningPlayerId: "123",
          winningPunchlines: ["To go to KFC"],
        });
      });
    });
  });
});
