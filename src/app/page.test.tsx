import { expect, test } from "vitest";
import Home from "./page";

test("Home component exports a function", () => {
    expect(typeof Home).toBe("function");
});
