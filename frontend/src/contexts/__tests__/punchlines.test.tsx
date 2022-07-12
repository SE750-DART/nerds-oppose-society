import { act, renderHook, RenderResult } from "@testing-library/react-hooks";
import {
  PunchlinesAction,
  PunchlinesProvider,
  usePunchlines,
} from "../punchlines";

const setupRemoveTest = (
  result: RenderResult<ReturnType<typeof usePunchlines>>
) => {
  const [, dispatch] = result.current;
  act(() =>
    dispatch({
      type: PunchlinesAction.ADD,
      punchlines: ["Testing 123", "Testing ABC"],
    })
  );

  const [punchlines] = result.current;
  expect(punchlines).toEqual([
    { text: "Testing 123" },
    { text: "Testing ABC" },
  ]);
};

describe("usePunchlines()", () => {
  it("returns punchlines context when used inside PunchlinesProvider", () => {
    const { result } = renderHook(() => usePunchlines(), {
      wrapper: PunchlinesProvider,
    });

    const [punchlines, dispatch] = result.current;
    expect(punchlines).toEqual([]);
    expect(dispatch).toBeDefined();
  });

  it("throws error when used outside PunchlinesProvider", () => {
    const { result } = renderHook(() => usePunchlines());

    expect(result.error).toEqual(
      Error("usePunchlines() must be used within a PunchlinesProvider")
    );
  });

  describe("dispatch()", () => {
    describe("ADD", () => {
      it("adds multiple punchlines through", () => {
        const { result } = renderHook(() => usePunchlines(), {
          wrapper: PunchlinesProvider,
        });

        let [punchlines] = result.current;
        expect(punchlines).toEqual([]);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: PunchlinesAction.ADD,
            punchlines: ["Testing 123", "Testing ABC"],
          })
        );

        [punchlines] = result.current;
        expect(punchlines).toEqual([
          { text: "Testing 123" },
          { text: "Testing ABC" },
        ]);
      });

      it("adds successive punchlines", () => {
        const { result } = renderHook(() => usePunchlines(), {
          wrapper: PunchlinesProvider,
        });

        let [punchlines] = result.current;
        expect(punchlines).toEqual([]);

        let [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: PunchlinesAction.ADD,
            punchlines: ["Testing 123"],
          })
        );

        [punchlines] = result.current;
        expect(punchlines).toEqual([{ text: "Testing 123" }]);

        [, dispatch] = result.current;
        act(() =>
          dispatch({ type: PunchlinesAction.ADD, punchlines: ["Testing ABC"] })
        );

        [punchlines] = result.current;
        expect(punchlines).toEqual([
          { text: "Testing 123" },
          { text: "Testing ABC" },
        ]);
      });

      it("does not modify state when adding empty punchlines", () => {
        const { result } = renderHook(() => usePunchlines(), {
          wrapper: PunchlinesProvider,
        });

        const [punchlinesInitial] = result.current;
        expect(punchlinesInitial).toEqual([]);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: PunchlinesAction.ADD,
            punchlines: [],
          })
        );

        const [punchlines] = result.current;
        expect(punchlines).toEqual([]);
        expect(punchlinesInitial).toBe(punchlines);
      });
    });

    describe("REMOVE", () => {
      it("removes multiple punchlines", () => {
        const { result } = renderHook(() => usePunchlines(), {
          wrapper: PunchlinesProvider,
        });
        setupRemoveTest(result);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: PunchlinesAction.REMOVE,
            punchlines: ["Testing 123", "Testing ABC"],
          })
        );

        const [punchlines] = result.current;
        expect(punchlines).toEqual([]);
      });

      it("removes successive punchlines", () => {
        const { result } = renderHook(() => usePunchlines(), {
          wrapper: PunchlinesProvider,
        });
        setupRemoveTest(result);

        let [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: PunchlinesAction.REMOVE,
            punchlines: ["Testing ABC"],
          })
        );

        let [punchlines] = result.current;
        expect(punchlines).toEqual([{ text: "Testing 123" }]);

        [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: PunchlinesAction.REMOVE,
            punchlines: ["Testing 123"],
          })
        );

        [punchlines] = result.current;
        expect(punchlines).toEqual([]);
      });

      it("does not remove non-existent punchline", () => {
        const { result } = renderHook(() => usePunchlines(), {
          wrapper: PunchlinesProvider,
        });
        setupRemoveTest(result);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: PunchlinesAction.REMOVE,
            punchlines: ["Testing XYZ"],
          })
        );

        const [punchlines] = result.current;
        expect(punchlines).toEqual([
          { text: "Testing 123" },
          { text: "Testing ABC" },
        ]);
      });

      it("does not modify state when removing empty punchlines", () => {
        const { result } = renderHook(() => usePunchlines(), {
          wrapper: PunchlinesProvider,
        });

        const [initialPunchlines] = result.current;
        expect(initialPunchlines).toEqual([]);

        const [, dispatch] = result.current;
        act(() =>
          dispatch({
            type: PunchlinesAction.REMOVE,
            punchlines: [],
          })
        );

        const [punchlines] = result.current;
        expect(punchlines).toEqual([]);
        expect(punchlines).toBe(initialPunchlines);
      });
    });
  });
});
