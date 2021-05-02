import { digitShortCode, shuffle } from "../index";

describe("Test digitShortCode", () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(Math, "random");
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("Lower bound", () => {
    spy.mockReturnValue(0.0);

    const code = digitShortCode(6);
    console.log(code);

    expect(`${code}`).toHaveLength(6);
  });

  it("Upper bound", () => {
    spy.mockReturnValue(0.999999999999);

    const code = digitShortCode(6);
    console.log(code);

    expect(`${code}`).toHaveLength(6);
  });
});

describe("Test shuffle", () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(Math, "random");
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("Shuffle strings", () => {
    const before = ["a", "b", "c", "d", "e"];

    const after = shuffle(before);

    expect(after).toHaveLength(before.length);
    expect(after).not.toBe(before);
    expect(after).toEqual(expect.arrayContaining(before));
    expect(spy.mock.calls).toHaveLength(before.length);
  });
});
