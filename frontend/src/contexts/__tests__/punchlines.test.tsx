import { renderHook } from "@testing-library/react-hooks";
import { PunchlinesProvider, usePunchlines } from "../punchlines";

describe("usePunchlines()", () => {
  it("returns punchlines context when used inside PunchlinesProvider", () => {
    const { result } = renderHook(() => usePunchlines(), {
      wrapper: PunchlinesProvider,
    });

    const { punchlines } = result.current;
    expect(punchlines).toEqual([]);
  });

  it("throws error when used outside PunchlinesProvider", () => {
    const { result } = renderHook(() => usePunchlines());

    expect(result.error).toEqual(
      Error("usePunchlines() must be used within a PunchlinesProvider")
    );
  });
});
