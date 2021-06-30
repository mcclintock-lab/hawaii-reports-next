/**
 * @group smoke
 */
import Handler from "./humanImpact";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

const humanImpact = Handler.func;

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof humanImpact).toBe("function");
  });
  test("tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll("hawaii-");
    for (const example of examples) {
      const result = await humanImpact(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "humanImpact", example.properties.name);
    }
  });
});
