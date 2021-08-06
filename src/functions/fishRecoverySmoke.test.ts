/**
 * @jest-environment node
 * @group smoke
 */
import { fishRecovery } from "./fishRecovery";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("smoke tests", () => {
  it("has a handler function", () => {
    expect(typeof fishRecovery).toBe("function");
  });
  it("find for all types", async () => {
    const examples = await getExamplePolygonSketchAll("hawaii-");
    for (const example of examples) {
      console.log(example.properties.name);
      const result = await fishRecovery(example);
      console.log(result);
      expect(result).toBeTruthy();
      expect(result.potentialBySketch.length).toBeGreaterThanOrEqual(1);
      expect(result.potential.biomassIncrease).toBeGreaterThanOrEqual(0);
      expect(
        result.potential.avgPercBiomassIncrease === undefined ||
          result.potential?.avgPercBiomassIncrease >= 0
      ).toBe(true);
      expect(
        result.potential.avgLengthIncrease === undefined ||
          result.potential.avgLengthIncrease >= 0
      ).toBe(true);
      expect(
        result.potential.avgPercLengthIncrease === undefined ||
          result.potential.avgPercLengthIncrease >= 0
      ).toBe(true);
      writeResultOutput(result, "fishRecovery", example.properties.name);
    }
  });
});
