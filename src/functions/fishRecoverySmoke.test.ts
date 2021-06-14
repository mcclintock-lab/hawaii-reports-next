/**
 * @jest-environment node
 * @group smoke
 */
import { fishRecovery } from "./fishRecovery";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Fish recovery smoke tests", () => {
  it("has a handler function is present", () => {
    expect(typeof fishRecovery).toBe("function");
  });
  it("is able to run hawaii examples", async () => {
    const examples = await getExamplePolygonSketchAll("hawaii-kaunakakai");
    for (const example of examples) {
      const result = await fishRecovery(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "fishRecovery", example.properties.name);
      expect(result.avgBiomass).toBeGreaterThanOrEqual(0);
    }
  });
});
