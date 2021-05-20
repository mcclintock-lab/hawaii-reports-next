/**
 * @group smoke
 */
import Handler from "./overlapMpa";
import {
  getExampleSketches,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

const overlapMpa = Handler.func;

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof overlapMpa).toBe("function");
  });
  test("tests run against all examples", async () => {
    const examples = await getExampleSketches();
    for (const example of examples) {
      const result = await overlapMpa(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "overlapMpa", example.properties.name);
    }
  });
});
