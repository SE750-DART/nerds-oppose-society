import { act, renderHook, RenderResult } from "@testing-library/react-hooks";
import { PlayersActions, PlayersProvider, usePlayers } from "../players";

describe("usePlayers()", () => {
  it("returns players context when used inside PlayerProvider", () => {
    const { result } = renderHook(() => usePlayers(), {
      wrapper: PlayersProvider,
    });

    const [{ players, host, count }, dispatch] = result.current;
    expect(players).toEqual({});
    expect(host).toBe(undefined);
    expect(count).toBe(0);
    expect(dispatch).toBeDefined();
  });

  it("throws error when used outside PlayerProvider", () => {
    const { result } = renderHook(() => usePlayers());

    expect(result.error).toEqual(
      Error("usePlayers() must be used within a PlayersProvider")
    );
  });

  describe("dispatch()", () => {
    const setupPlayer = (
      result: RenderResult<ReturnType<typeof usePlayers>>
    ) => {
      const [, dispatch] = result.current;
      act(() =>
        dispatch({
          type: PlayersActions.ADD,
          id: "123",
          nickname: "Digits",
        })
      );

      const [{ players, host, count }] = result.current;
      expect(players).toEqual({
        "123": {
          id: "123",
          nickname: "Digits",
          score: 0,
        },
      });
      expect(host).toBe(undefined);
      expect(count).toBe(1);
    };

    describe("INITIALISE", () => {
      it("sets players and count while preserving host", () => {
        const { result } = renderHook(() => usePlayers(), {
          wrapper: PlayersProvider,
        });

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: PlayersActions.INITIALISE,
            players: [
              { id: "123", nickname: "Digits", score: 0 },
              { id: "abc", nickname: "Letters", score: 3 },
            ],
          })
        );

        const [{ players, host, count }] = result.current;
        expect(players).toEqual({
          "123": {
            id: "123",
            nickname: "Digits",
            score: 0,
          },
          abc: {
            id: "abc",
            nickname: "Letters",
            score: 3,
          },
        });
        expect(host).toBe(undefined);
        expect(count).toBe(2);
      });
    });

    describe("ADD", () => {
      it("adds new player and increments count", () => {
        const { result } = renderHook(() => usePlayers(), {
          wrapper: PlayersProvider,
        });

        setupPlayer(result);
      });

      it("overwrites existing player and maintains count", () => {
        const { result } = renderHook(() => usePlayers(), {
          wrapper: PlayersProvider,
        });
        setupPlayer(result);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: PlayersActions.ADD,
            id: "123",
            nickname: "Numerals",
          })
        );

        const [{ players, host, count }] = result.current;
        expect(players).toEqual({
          "123": {
            id: "123",
            nickname: "Numerals",
            score: 0,
          },
        });
        expect(host).toBe(undefined);
        expect(count).toBe(1);
      });
    });

    describe("REMOVE", () => {
      it("removes existing player and decrements count", () => {
        const { result } = renderHook(() => usePlayers(), {
          wrapper: PlayersProvider,
        });
        setupPlayer(result);

        const [, dispatch] = result.current;
        act(() => dispatch({ type: PlayersActions.REMOVE, id: "123" }));

        const [{ players, host, count }] = result.current;
        expect(players).toEqual({});
        expect(host).toBe(undefined);
        expect(count).toBe(0);
      });

      it("does not modify state object if player does not exist", () => {
        const { result } = renderHook(() => usePlayers(), {
          wrapper: PlayersProvider,
        });
        setupPlayer(result);

        const [initialState, dispatch] = result.current;
        act(() => dispatch({ type: PlayersActions.REMOVE, id: "abc" }));

        const [state] = result.current;
        const { players, host, count } = state;
        expect(players).toEqual({
          "123": {
            id: "123",
            nickname: "Digits",
            score: 0,
          },
        });
        expect(host).toBe(undefined);
        expect(count).toBe(1);
        expect(state).toBe(initialState);
      });
    });

    describe("INCREMENT_SCORE", () => {
      it("increases score for existent player", () => {
        const { result } = renderHook(() => usePlayers(), {
          wrapper: PlayersProvider,
        });
        setupPlayer(result);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({ type: PlayersActions.INCREMENT_SCORE, id: "123" })
        );

        const [state] = result.current;
        const { players, host, count } = state;
        expect(players).toEqual({
          "123": {
            id: "123",
            nickname: "Digits",
            score: 1,
          },
        });
        expect(host).toBe(undefined);
        expect(count).toBe(1);
      });

      it("does not modify state object if player does not exist", () => {
        const { result } = renderHook(() => usePlayers(), {
          wrapper: PlayersProvider,
        });
        setupPlayer(result);

        const [initialState, dispatch] = result.current;
        act(() =>
          dispatch({ type: PlayersActions.INCREMENT_SCORE, id: "abc" })
        );

        const [state] = result.current;
        const { players, host, count } = state;
        expect(players).toEqual({
          "123": {
            id: "123",
            nickname: "Digits",
            score: 0,
          },
        });
        expect(host).toBe(undefined);
        expect(count).toBe(1);
        expect(state).toBe(initialState);
      });
    });

    describe("SET_HOST", () => {
      it("sets host regardless of if player exists", () => {
        const { result } = renderHook(() => usePlayers(), {
          wrapper: PlayersProvider,
        });
        setupPlayer(result);

        const [, dispatch] = result.current;
        act(() => dispatch({ type: PlayersActions.SET_HOST, id: "abc" }));

        const [state] = result.current;
        const { players, host, count } = state;
        expect(players).toEqual({
          "123": {
            id: "123",
            nickname: "Digits",
            score: 0,
          },
        });
        expect(host).toBe("abc");
        expect(count).toBe(1);
      });
    });
  });
});
