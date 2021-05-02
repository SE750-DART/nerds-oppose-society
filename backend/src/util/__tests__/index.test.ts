import { digitShortCode } from "../index";

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

    expect(`${code}`.length).toBe(6);
  });

  it("Upper bound", () => {
    spy.mockReturnValue(0.999999999999);

    const code = digitShortCode(6);
    console.log(code);

    expect(`${code}`.length).toBe(6);
  });
});
