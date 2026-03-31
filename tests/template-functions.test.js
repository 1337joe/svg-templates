import { describe, it, expect } from "vitest";
import { truncatedConeParameters } from "../src/js/template-functions.js";

describe("truncatedConeParameters", () => {
  it("calculates parameters for a simple truncated cone", () => {
    // 3:4:5 triangle for easy verification (note that maxD is diameter, so double the 3)
    const truncatedHeight = 1 / 4; // cut off the bottom 1/4 of the cone, calculate height, min diameter, and resulting inner radius from this
    const parameters = truncatedConeParameters(6, 6 * truncatedHeight, 4 * (1 - truncatedHeight));
    expect(parameters.outerRadius).toBeCloseTo(5);
    expect(parameters.innerRadius).toBeCloseTo(5 * truncatedHeight);
    expect(parameters.coneAngleRad).toBeCloseTo((216 * Math.PI) / 180);
  });
});
