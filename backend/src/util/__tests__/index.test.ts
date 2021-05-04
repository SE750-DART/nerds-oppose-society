import { digitShortCode, shuffle } from "../index";

describe("digitShortCode Util", () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(Math, "random");
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("returns a lower bound of correct length", () => {
    spy.mockReturnValue(0.0);

    const code = digitShortCode(6);

    expect(`${code}`).toHaveLength(6);
  });

  it("returns an upper bound of correct length", () => {
    spy.mockReturnValue(0.999999999999);

    const code = digitShortCode(6);

    expect(`${code}`).toHaveLength(6);
  });
});

describe("shuffle Util", () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(Math, "random");
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("returns a shuffled array containing all original elements", () => {
    const before = ["a", "b", "c", "d", "e"];

    const after = shuffle(before);

    expect(after).toHaveLength(before.length);
    expect(after).not.toBe(before);
    expect(after).toEqual(expect.arrayContaining(before));
    expect(spy.mock.calls).toHaveLength(before.length);
  });
});
